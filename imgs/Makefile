# set the default goal.
.DEFAULT_GOAL := list
#.phony: list gitupdate clean



list:
	ls -l



gitupdate:
	git add .; git commit -m "update imgs dir"; git push

clean:
	echo "imgs: make clean"
	#-find . -name "*.backup" -print | xargs rm
	-rm *.backup *.BACKUP *.swp *.key
