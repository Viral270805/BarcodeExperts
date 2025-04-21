# i2c_lcd.py
import time
from smbus2 import SMBus

class I2CLcd:
    def __init__(self, i2c_addr, port=1):
        self.addr = i2c_addr
        self.bus = SMBus(port)
        self.lcd_init()

    def lcd_init(self):
        self.lcd_write(0x33, 0)
        self.lcd_write(0x32, 0)
        self.lcd_write(0x06, 0)
        self.lcd_write(0x0C, 0)
        self.lcd_write(0x28, 0)
        self.lcd_write(0x01, 0)
        time.sleep(0.05)

    def lcd_write(self, bits, mode):
        bits_high = mode | (bits & 0xF0) | 0x08
        bits_low = mode | ((bits << 4) & 0xF0) | 0x08
        self.bus.write_byte(self.addr, bits_high)
        self.lcd_toggle_enable(bits_high)
        self.bus.write_byte(self.addr, bits_low)
        self.lcd_toggle_enable(bits_low)

    def lcd_toggle_enable(self, bits):
        time.sleep(0.0005)
        self.bus.write_byte(self.addr, (bits | 0x04))
        time.sleep(0.0005)
        self.bus.write_byte(self.addr, (bits & ~0x04))
        time.sleep(0.0005)

    def clear(self):
        self.lcd_write(0x01, 0)

    def write(self, message, line=1):
        if line == 1:
            self.lcd_write(0x80, 0)
        elif line == 2:
            self.lcd_write(0xC0, 0)
        for char in message.ljust(16):
            self.lcd_write(ord(char), 1)
