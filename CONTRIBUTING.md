Thank you for your interest in contributing to the Muse Systems xTuple ERP Utilities package.  We welcome contributions and input from the community and have established the following guidelines for managing such contributions.

Suggestions and Bug Reports
---------------------------
We use our <a href="https://gitlab.com/musesystems/musextputils" target="_blank">GitLab repository's</a> <a href="https://gitlab.com/musesystems-incubator/musextputils/issues" target="_blank">issue tracker</a> for managing all requests that relate to the musextputils package.  If you experience an issue of have a suggestion to make, please open an issue there.  The project maintainers will try to respond within 5 business days.  Ultimately, we can only respond to requests as resources permit.  If you want to expedite changes or see specific requirements fulfilled, we can be engaged to do so by contacting us via our <a href="https://muse.systems/contact/" target="_blank">corporate contact page</a>.

Contributing Code or Participating in Design
---------------------------------------------
If you think you would like to participate more deeply, we would be happy to consider your merge requests or input on design features.  There are currently two paths by which this package will evolve:

1) Muse Systems Internal Development Process ("Muse Process")

2) Community Development Process ("Community Process")

The Muse Process will incorporate designs and development efforts undertaken within Muse Systems or as engaged on specific Muse client projects.  This development will largely be handled internally and the code will be contributed back to the community on completion (unless there is some specific prohibition against so doing).  The Muse Process will largely not be public and will be driven commercially: this model is really the standard closed source development process.  We expect the vast majority of development to happen this way.

The Community Process will be different.  That process will be more in line with open source development practices in terms of community input and development.  We don't expect much product evolution conducted via the Community Process, but would absolutely welcome it if there is interest.  If the Community Process were to have sufficient interest and efficiency, we would gladly reconsider having a primary "Muse Process" at all.

### The Community Process
Below are the steps in the community development process.  These are designed to take a new product change or feature from conception to final release.  The Muse Systems xTuple ERP Utilities package is a small work with a limited audience so we don't see the need for too much ceremony.  However, some ground rules are appropriate.

1) If you have an idea for a change to existing functionality or are interested in designing/developing a new feature, start by first submitting an RFC for that new work to the <a href="https://gitlab.com/musesystems-incubator/musextputils/issues" target="_blank">GitLab issue tracker</a> for the project.  You should include a basic description of the change, what purpose or goal is achieved by the change, try to assess any foreseeable downsides, and identify who will do the development work.  While not necessary, it could also be helpful to note any alternatives considered and why they are inferior.  Note that the initial issue text may change over time in response to community input.

2) This RFC will be open to community comment for a time.  The specific time depends on the nature of the change and scope as assessed by the maintainers.  Initially we expect a short comment period simply because of the limited interest there will be in this project, indeed, it's likely the only commentators will be the maintainers themselves.

3) The RFC will ultimately be either accepted, rejected, or receive a request for clarification/alteration by the maintainers.  On rejection the RFC issue is closed with a brief explanation as to why.

4) Once the RFC is approved by the maintainers, development commences by the developers.  We use the standard "<a href="https://www.atlassian.com/git/tutorials/comparing-workflows#gitflow-workflow" target="_blank">Git Flow</a>" process for managing our development.  The maintainers will add a new feature branch based on the then current "develop" branch.  The developers should clone the repository locally, checkout the assigned feature branch, and do their work on the feature branch.

5) Once work is complete, the developers will push the feature branch to the repository and create a merge request to merge the feature branch to the "develop" branch.

6) The maintainers will perform a code review and either accept the merge request, ask for changes prior to merge, or reject it outright if the merge request requires substantial work before it can be accepted.

Once the work is merged with the develop branch, it will automatically be included into the next release of the package.

### Basic Ground Rules for Code Submission
We have a few simple requirements for any code submission before it can be merged with the package.

1) We don't have a formal style guide as such, but we try to be reasonably consistent.

2) Don't abuse the global namespace.  Unfortunately, this is a common practice in xTuple package development and we cannot perpetuate it here.  If something goes into the global namespace, there must be a compelling reason.

3) There is a camp that likes commented code, and one which abhors it.  We like it and we should be more consistent in doing so.

4) The big controversial requirement: we want you to get credit for any code you submit, but we must insist on copyright assignment to Muse Systems.  There are a number of reasons for this, but most importantly, we don't want any complexity in terms of how the future of this package may evolve.  We want to offer this code to the community, but at the same time we may find ourselves in situations where we must dual license the code on a commercial basis or similar.  We will promise that you will receive an appropriate place in the list of contributors and that any submission will appear in at least one open source release of the package.  We will nonetheless reserve the right to issue the work under other licenses, commercially license, sell the intellectual property rights to the package without further notice or permission from the contributors, and possibly cease public distribution of the package.  Having said that, the heat death of the universe will likely come pass before any of that becomes an issue for this software package... and even that's assuming there's interest outside of Muse System in contributing code!   

