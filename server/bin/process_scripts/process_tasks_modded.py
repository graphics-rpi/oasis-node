import sys
import os
from random import randint
import time
import fcntl
import Queue
import threading
import logging
import subprocess
from datetime import datetime
import psycopg2

# What does this do?
logging.basicConfig(level=logging.DEBUG,
          format='[%(levelname)s] (%(threadName)-10s) %(message)s',
          )

def lockFile(lockfile):
  # This function returns true if we can put a lock on this file
  # or
  # lockfile -> a file we check to see if we can put a lock on

  fp = open(lockfile, 'a')
  try:
    # setting up an exlusive lock & LOCK_NB to avoid blocking on lock acquisition
    fcntl.lockf(fp, fcntl.LOCK_EX | fcntl.LOCK_NB)
  except:
    return False
  return True

def printfiles(location):
  # For each file in the directly print to console
  dirs = os.listdir( location )
  for file in dirs:
    print file

def deletefiles(location):
  # Deletes all files in a directory
  dirs = os.listdir( location )
  for file in dirs:
    try:
      os.remove(file)
    except:
      print ("error " + file)


def thesomething(filename, location):
  # Where we would put our script that does yo thang here
  try:
    with open(os.path.join(location, filename),'r') as task_file:

      logging.debug('starting a jobs...')
      # Arguments for run_daylighting.sh
      in_out  = task_file.readline() # /var/www/oasis/user_output/texture/xtodgn/sim_0101_1300_-10500_CLEAR_fcv/
      month   = task_file.readline() # mm
      day   = task_file.readline() # dd
      hour  = task_file.readline() # hh
      minute  = task_file.readline() # mm
      tz_sign = task_file.readline() # 1 or -1
      tz_hr   = task_file.readline() # hh
      tz_min  = task_file.readline() # mm
      weather = task_file.readline() # weather
      colormode = task_file.readline()
      model_path = task_file.readline()

      in_out  = in_out.strip('\n')
      month   = month.strip('\n')
      day   = day.strip('\n')
      hour  = hour.strip('\n')
      minute  = minute.strip('\n')
      tz_sign = tz_sign.strip('\n')
      tz_hr   = tz_hr.strip('\n')
      tz_min  = tz_min.strip('\n')
      weather = weather.strip('\n')
      colormode = colormode.strip('\n')
      model_path = model_path.strip('\n')


      GMT_hr,GMT_min = convert_to_GMT(hour,minute,tz_sign,tz_hr,tz_min)

      errors_log = in_out + "errors.log"
      bash_str = "~/oasis-node/server/bin/run_daylighting.sh %s %s %s %s %s %s %s %s > %s"%(in_out, month, day, GMT_hr, GMT_min, weather, colormode, model_path, errors_log)
      logging.debug( "Running bash: %s"%(bash_str))
      # We ask for the result, because it foreces it wait until task is done
      t_before = int(time.time())
      res = subprocess.Popen(bash_str, shell=True)

      while res.poll() is None:
        logging.debug("still running...")
        time.sleep(0.5)

      t_prog_ran = int(time.time()) - t_before;

      logging.debug( "Done with bash: %s"%(bash_str))

      return True

  except:
    print("more error")
    return False

def convert_to_GMT(hour,minute,tz_sign,tz_hr,tz_min):
  return int(hour) + (-1 * int(tz_sign) * int(tz_hr)), int(minute) + (-1 * int(tz_sign) * int(tz_min))

def dosomething(filename, location):
  if (os.path.isfile(os.path.join(location, filename + '.lock')) == False):

    logging.debug('Creating lock file for job...')

    lockFile(os.path.join(location, filename + '.lock'))
    lockname = filename + ".lock"

    logging.debug("Processsing " + filename)

    #do yo thang here
    if(thesomething(filename, location)):
      os.remove(os.path.join(location, lockname))
      os.remove(os.path.join(location, filename))
      logging.debug("Processed " + filename)
    else:
      logging.debug("Failed " + filename)

def process_jobs():
  start_time = datetime.now();
  #tasks_loc = raw_input('Enter location of tasks ') # Name of text file coerced with +.txt
  #output_loc = raw_input('Enter location of output ')

  tasks_loc = '~/oasis-node/server/user_task/lsvo'
  # output_loc = '../output_folder/'

  #on mac happens in alpha/creation time, linux seems to be random
  #order this somehow maybe?
  while( (datetime.now() - start_time).seconds < 70 ):

    if(len(os.listdir(tasks_loc)) == 0):
      logging.debug('sleeping bc no jobs...')
      time.sleep(1)
      continue

    for t in os.listdir(tasks_loc):
      logging.debug('looking for jobs...')
      if t.endswith(".task"):
        logging.debug('found jobs...')
        dosomething(t, tasks_loc)
        time.sleep(.1)

  logging.debug('bye bye...')

process_jobs();

# arrayofkeywords = ['thor', 'loki', 'neptune', 'zeus', 'mario', 'luigi']
# maxThreads = 3.0;
#
# for i in arrayofkeywords:
#   t = threading.Thread(name=i, target=process_jobs)
#   t.start()
#   time.sleep(.1)
