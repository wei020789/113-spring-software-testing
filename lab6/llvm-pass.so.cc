#include "llvm/Passes/PassPlugin.h"
#include "llvm/Passes/PassBuilder.h"
#include "llvm/IR/IRBuilder.h"
#include "llvm/IR/Module.h"
#include "llvm/IR/Function.h"
#include "llvm/IR/Instructions.h"
#include "llvm/IR/Constants.h"
#include <vector>

using namespace llvm;

// 定義一個 Module Pass
struct LLVMPass : PassInfoMixin<LLVMPass> {
    PreservedAnalyses run(Module &Mod, ModuleAnalysisManager &) {
        LLVMContext &Context = Mod.getContext();
        IntegerType *int32Type = Type::getInt32Ty(Context);
        PointerType *charPtrType = Type::getInt8PtrTy(Context);

        // 宣告 debug 函數原型：void debug(int)
        FunctionCallee dbgFunc = Mod.getOrInsertFunction(
            "debug",
            FunctionType::get(Type::getVoidTy(Context), {int32Type}, false)
        );
        // 常數 48763
        Constant *const48763 = ConstantInt::get(int32Type, 48763);

        // 準備字串 "hayaku... motohayaku!"
        Constant *msgContent = ConstantDataArray::getString(Context, "hayaku... motohayaku!", true);
        GlobalVariable *globalMsg = new GlobalVariable(
            Mod, msgContent->getType(), true,
            GlobalValue::PrivateLinkage, msgContent, "lab6_message");
        Value *msgPtr = ConstantExpr::getBitCast(globalMsg, charPtrType);

        // 處理 main 函數
        if (Function *mainFunc = Mod.getFunction("main")) {
            // 找到 argc, argv
            Argument *argArgc = nullptr, *argArgv = nullptr;
            auto iter = mainFunc->arg_begin();
            if (iter != mainFunc->arg_end()) argArgc = &*iter++;
            if (iter != mainFunc->arg_end()) argArgv = &*iter;

            // 先把 debug 呼叫插入 main 開頭
            IRBuilder<> builder(&*mainFunc->getEntryBlock().getFirstInsertionPt());
            builder.CreateCall(dbgFunc, { const48763 });

            // 用來記錄稍後要刪除的 load 指令
            std::vector<Instruction*> removeList;

            // 逐個基本區塊與指令掃描
            for (auto &block : *mainFunc) {
                for (auto &inst : block) {
                    // 替換對 argc 的引用為 48763
                    for (unsigned idx = 0; idx < inst.getNumOperands(); ++idx) {
                        if (inst.getOperand(idx) == argArgc) {
                            inst.setOperand(idx, const48763);
                        }
                    }

                    // 處理 load 指令（找 argv[1]）
                    if (auto *loadInst = dyn_cast<LoadInst>(&inst)) {
                        Value *gepSource = loadInst->getPointerOperand()->stripPointerCasts();
                        if (auto *gepInst = dyn_cast<GetElementPtrInst>(gepSource)) {
                            if (gepInst->getNumIndices() == 1) {
                                if (auto *constIdx = dyn_cast<ConstantInt>(gepInst->getOperand(1))) {
                                    if (constIdx->equalsInt(1)) {
                                        // 替換 load argv[1] 為常數字串
                                        loadInst->replaceAllUsesWith(msgPtr);
                                        removeList.push_back(loadInst);
                                    }
                                }
                            }
                        }
                    }

                    // 找 strcmp 呼叫，把第一個參數換成常數字串
                    if (auto *callInst = dyn_cast<CallInst>(&inst)) {
                        if (Function *calleeFunc = callInst->getCalledFunction()) {
                            if (calleeFunc->getName() == "strcmp" && callInst->arg_size() >= 2) {
                                callInst->setArgOperand(0, msgPtr);
                            }
                        }
                    }
                }
            }

            // 刪掉被替換的 load 指令
            for (auto *instToErase : removeList) {
                instToErase->eraseFromParent();
            }
        }

        return PreservedAnalyses::none();
    }
};

// 註冊這個 pass
extern "C" ::llvm::PassPluginLibraryInfo LLVM_ATTRIBUTE_WEAK
llvmGetPassPluginInfo() {
  return {LLVM_PLUGIN_API_VERSION, "LLVMPass", "1.0",
    [](PassBuilder &PB) {
      PB.registerOptimizerLastEPCallback(
        [](ModulePassManager &MPM, OptimizationLevel OL) {
          MPM.addPass(LLVMPass());
        });
    }};
}
