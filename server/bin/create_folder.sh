echo "Run under sudo"

sudo mkdir ../bug_reports
sudo mkdir ../user_output
sudo mkdir ../user_task
sudo mkdir ../user_task/lsvo
sudo mkdir ../user_task/remesh
sudo mkdir ../user_task/remesh/task
sudo mkdir ../user_task/remesh/wall

sudo chown -R www-data:www-data ../bug_reports
sudo chown -R www-data:www-data ../user_output
sudo chown -R www-data:www-data ../user_task
sudo chown -R www-data:www-data ../user_task/lsvo
sudo chown -R www-data:www-data ../user_task/remesh
sudo chown -R www-data:www-data ../user_task/remesh/task
sudo chown -R www-data:www-data ../user_task/remesh/wall
