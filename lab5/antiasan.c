#include <string.h>

void antiasan(unsigned long addr) {
    // The address of the shadow memory is 0x7fff8000
    unsigned long shadow   = ((addr + 0x87 ) >> 3) + 0x7fff8000;

    for (int i = 0; i < 0x10; i += 1) {
        *(char *)(shadow + i) = 0;
    }
}