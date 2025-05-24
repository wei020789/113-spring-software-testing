const test = require('node:test');
const assert = require('assert');
const { MyClass, Student } = require('../src/calculator'); // 注意：路徑指向 calculator.js

// Test MyClass's addStudent method
test("Test MyClass's addStudent", () => {
    const myClass = new MyClass();
    const student = new Student();
    student.setName('John');
    
    const id = myClass.addStudent(student);
    assert.strictEqual(id, 0); // 第一位學生，id 應為 0
    
    const invalidStudent = {};
    const invalidId = myClass.addStudent(invalidStudent);
    assert.strictEqual(invalidId, -1); // 非 Student 物件應回傳 -1
});

// Test MyClass's getStudentById method
test("Test MyClass's getStudentById", () => {
    const myClass = new MyClass();
    const student = new Student();
    student.setName('Jane');
    
    myClass.addStudent(student);
    const retrievedStudent = myClass.getStudentById(0);
    assert.strictEqual(retrievedStudent.getName(), 'Jane');
    
    const nonExistentStudent = myClass.getStudentById(1);
    assert.strictEqual(nonExistentStudent, null); // 超出範圍應為 null
});

// Test Student's setName method
test("Test Student's setName", () => {
    const student = new Student();
    student.setName('Alice');
    assert.strictEqual(student.getName(), 'Alice');
    
    student.setName(123); // 非字串應忽略
    assert.strictEqual(student.getName(), 'Alice'); 
});

// Test Student's getName method
test("Test Student's getName", () => {
    const student = new Student();
    assert.strictEqual(student.getName(), ''); // 尚未設定應回傳空字串
    
    student.setName('Bob');
    assert.strictEqual(student.getName(), 'Bob');
});
