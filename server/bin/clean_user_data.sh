#!/bin/bash

read -p "Cleaning all local data. User cached user models, error reports, and task will be deleted. Are you sure?" -n 1 -r
echo  # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then

	# Cleaning Error Reports
	echo 'cleaning error reports'
	rm ../bug_reports/*

	# Cleaning local data on host machine
	echo 'cleaning user_output folder'
	rm -r ../user_output/*

	# Cleaning user task folder (lsvo)
	echo 'cleaning lsvo folder'
	rm -r ../user_task/lsvo/*

	# Cleaning remesh (which has loads b/c we don't do this parallel)
	echo 'cleaning remesh folder'
	rm -r  ../user_task/remesh/task/*
	rm -r  ../user_task/remesh/wall/*

fi

