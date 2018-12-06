import sys
import os
from random import randint


def write():
  print('Creating new text file')
  #loc = raw_input('Enter location ')
  loc = 'user_task'
  nums = input('How many files ')
  start = input('starting with index ')

  try:
    for i in range (start,start+nums):
      fn = "test" + `i` + ".txt"
      print("Creating..." + fn)
      file = open(os.path.join(loc, fn),'w')
      file.write("Random File #")
      file.write(`randint(1, 10000)`)
      file.close()

  except:
    print('Something went wrong! Can\'t tell what?')
    sys.exit(0) # quit Python

write()
