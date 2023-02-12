# set the default goal.
.DEFAULT_GOAL := list
#.phony: list_docs gitupdate clean



list:
	ls -l



gitupdate:
	git add .; git commit -m "update bin dir"; git push

clean:
	echo "bin: make clean"
	#-find . -name "*.backup" -print | xargs rm
	-rm *.backup *.BACKUP *.swp *.key
