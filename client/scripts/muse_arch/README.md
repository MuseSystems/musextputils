This folder contains QTScript related scripts which will be built into the
"musecarch" script at package load time.  This way we avoid multiple trips to
the database to load scripts.  Note that while you could simply import each
of the scripts here into whatever target script you are working with... you'll
really want to just use the "musearch" script in user projects.