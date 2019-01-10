0.2.6 / 2019-01-10
==================
 * feat(workers): add downloads worker to split up work
 * feat: add random property to version and package for easier splitting

0.2.5 / 2019-01-03
==================
 * fix: dont crash if `npmData.time` doesn't exist

0.2.4 / 2018-12-06
==================
 * fix: use querystring instead of url params to avoid issues with slashes

0.2.3 / 2018-12-06
==================
 * feat: add `package` property to `getVersion()`
 * refactor: make `getVersion()` a normal function rather than lambda

0.2.2 / 2018-12-06
==================
 * chore: download stats for November 2018

0.2.1 / 2018-12-05
==================
 * fix(postToTwitter): fix crash
 * chore: use --public option to get stack traces in pkg

0.2.0 / 2018-11-27
==================
 * fix: don't post pre-releases to Twitter
