// This JobCollection holds all jobs in our system.
// This includes jobs that execute Java processes (e.g., to trace an app),
// but also jobs that unpackage and check an uploaded application zip file.
Jobs = new JobCollection('jobs');
