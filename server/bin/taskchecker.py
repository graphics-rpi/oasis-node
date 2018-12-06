import os
import subprocess
import time
import shutil


def copytree(src, dst, symlinks=False, ignore=None):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks, ignore)
        else:
            shutil.copy2(s, d)

taskPath = '../user_task/'
lsvoPath = 'lsvo/task/'
remeshPath = 'remesh/task/'


lsvoTaskList = os.listdir(taskPath + lsvoPath)
remeshTaskList = os.listdir(taskPath + remeshPath)

for task in lsvoTaskList:
	if(task.split('.')[-1]=='lock'):
		continue

	taskId = task.split('.')[0]
	taskType = task.split('.')[1]
	# search for lock file
	lockFilename = taskId + '_' + taskType + '.lock'
	if not os.path.isfile(taskPath + lsvoPath + lockFilename):
		subprocess.Popen(['touch', taskPath + 'lsvo/task/' + lockFilename])

		args = []
		with open(taskPath+lsvoPath+task) as taskfileContents:
			for l in taskfileContents:
				args.append(l.strip('\n'))

		# model path
		model_path = args[-1]
		sim_path = args[0]

		# print model_path, sim_path
		# subprocess.Popen(['cp',model_path + 'slow/*.glcam',sim_path])
		copytree(model_path+'slow', sim_path)
		subprocess.Popen(['cp',model_path + 'tween/foo.mtl',sim_path])

		args = ['sh'] + ['run_daylighting.sh'] + args
		print args
		process = subprocess.Popen(args)
		runningTime = 0
		while process.poll() is None:
			runningTime+=0.5
			if(runningTime>=1000*60):
				print "PROCESS IS TAKING TOO LONG"
				break
			time.sleep(0.5)

		subprocess.Popen(['cp',model_path + 'tween/foo.obj',sim_path])
		subprocess.Popen(['rm', taskPath + 'lsvo/task/' + taskId + '.' + taskType + '.task'])
		subprocess.Popen(['rm', taskPath + 'lsvo/task/' + lockFilename])



for task in remeshTaskList:
	taskId = task.split('.')[0]

	# search for lock file
	lockFilename = taskId + '.lock'
	# lock file does not exist
	if not os.path.isfile(taskPath + remeshPath + lockFilename):
		subprocess.Popen(['touch', taskPath + 'remesh/task/' + lockFilename])

		# create lock file
		args = []
		with open(taskPath+remeshPath+task) as taskfileContents:
			for l in taskfileContents:
				args.append(l.strip('\n'))

		# print ['sh', 'run_remesher.sh', args[0], args[1]]
		#  run daylighting script
		process = subprocess.Popen(['sh', 'run_remesher.sh', args[0], args[1]])


		runningTime = 0
		while process.poll() is None:
			runningTime+=0.5

			if(runningTime>=1000*60):
				print "PROCESS IS TAKING TOO LONG"
				break
			time.sleep(0.5)

		subprocess.Popen(['rm', taskPath + 'remesh/wall/' + taskId + '.wall'])
		subprocess.Popen(['rm', taskPath + 'remesh/task/' + taskId + '.task'])
		subprocess.Popen(['rm', taskPath + 'remesh/task/' + lockFilename])

		# done

		#  on complete
			# delete lock file
			# send success to server
		# on error
			# delete lock file
			# send error to server
