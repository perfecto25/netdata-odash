# Netdata Open Dashboard (netdata-odash)

Netdata Open Dashboard is an open source dashboard for Netdata collector

It imposes no node limits and works by querying netdata API endpoints to gather host metrics


This dashboard has been tested on Fedora 43 linux and Rocky 9 linux only

## Installation

For odash to work, you will need a host with netdata installed and has its stream disabled (acts as a collector)

odash will connect to this host via API and query metrics



## Usage

start odash using the systemd script provided

to change default ports, you can use .env file or export these ENV variables

    NETDATA_PORT=19999

    ODASH_PORT=8080


## Build from source

odash requires Crystal language and PCRE devel package

    dnf install pcre-devel

    crystal build src/netdata-odash.cr -o bin/netdata-odash
    
## Roadmap

- add dynamic assistant section - for last 5 min timeframe - check all chart metrics and show warning signs, ie load avg 1min is high, disk IO is high, show warning in this section that load avg + disk io are high and suggest cause for this



## Development

You can contribute to this project by forking this repo and submitting a PR


## Contributing

1. Fork it (<https://github.com/perfecto25/netdata-odash/fork>)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## Contributors

- [mreider](https://github.com/perfecto25) - creator and maintainer
