yarn-converge
=============

usage: `yarn-converge [lockfile]`

over time, yarn.lock can come to contain multiple different versions
of a dependency, even when their requested version ranges overlap.
yarn-converge will list any packages that could be coalesced into
fewer distinct versions.
