# Import files
import sys,os
import psycopg2

def main():

	connected = False
	tries = 3

	while not connected and tries > 0:

		db_name = raw_input("Enter database name followed by pressing [Enter]: ")
		db_host = raw_input("Enter database host followed by pressing [Enter]: ")
		db_user = raw_input("Enter database www-data's username followed by pressing [Enter]: ")
		db_pswd = raw_input("Enter database www-data's password followed by pressing [Enter]: ")

		sql = "dbname='%s' user='%s' host='%s' password='%s'"%(db_name,db_user,db_host,db_pswd)

		try:
			print "Successful connection to database!"
			conn = psycopg2.connect(sql)
			connected = True

		except:
			print "Unable to connect, try again..."
			tries -= 1


	if connected :

		# Generate the php config connect file
		# cf = open("../php/config.new.php", "w")
		cf = open("../php/config.inc.php", "w")
		cf.write("<?php")
		cf.write("\n")
		cf.write("$db_host = \"%s\";"%(db_host))
		cf.write("\n")
		cf.write("$db_user = \"%s\";"%(db_user))
		cf.write("\n")
		cf.write("$db_pswd = \"%s\";"%(db_pswd))
		cf.write("\n")
		cf.write("$db_name = \"%s\";"%(db_name))
		cf.write("\n")
		cf.write("$pg = pg_connect(\"host=$db_host user=$db_user password=$db_pswd dbname=$db_name\") or die(\"Cannot connect to database.\");")
		cf.write("\n")
		cf.write("?>")
		cf.close()

		# Generate the php database file
		# cf = open("../bin/process_scripts/database.new.php","w")
		cf = open("../bin/process_scripts/database.inc.php","w")
		cf.write("<?php")
		cf.write("\n")
		cf.write("# %s"%(db_user))
		cf.write("\n")
		cf.write("# %s"%(db_pswd))
		cf.write("\n")
		cf.write("# %s"%(db_host))
		cf.write("\n")
		cf.write("# %s"%(db_name))
		cf.write("\n")
		cf.write("?>")
		cf.close()

		print "Generated bin/process_scripts/database.ini.php"
		print "Generated js/config.ini.php"

	else:
		print "Please contact Barbara Cutler for this information."

if __name__ == "__main__":
  main()





