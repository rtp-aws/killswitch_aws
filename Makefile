# http://www.gnu.org/software/make/manual/make.html#Special-Variables

# set the default goal.
# I want the default to really just dump contents of dirs
# as a stub.  For instance, I don't want it to
# push code or
.DEFAULT_GOAL := gitupdate
#.phony: all deploy gitupdate clean $(DIRS)

TOPTARGETS := all clean

SUBDIRS := docs bin imgs secrets
#SUBDIRS := $(wildcard */.)
#BUCKET := some-bucket

$(TOPTARGETS): $(SUBDIRS)
$(SUBDIRS):
	echo "make arg is" $(MAKECMDGOALS)
	$(MAKE) -C $@ $(MAKECMDGOALS)

#.phony: $(TOPTARGETS) $(SUBDIRS)


gitupdate: clean
	#./bin/find_dupes.sh
	git add --all; git commit -m "wip"; git push

SUBCLEAN = $(addsuffix .clean,$(SUBDIRS))

clean: $(SUBCLEAN)

$(SUBCLEAN): %.clean:
#	echo "top: make clean"
#	echo "top: subdirs is $(SUBDIRS)"
#	echo "clean in top dir"
#	echo "first prereq "$<
#	echo "top: all prereqs "$?
#	echo "top: all prereqs " $(SUBDIRS)
#	make -C $? clean
	-rm *.backup *.swp *.BACKUP
	$(MAKE) -C $* clean


