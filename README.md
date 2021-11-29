# Ynvoice
Basic Invoice program. Originally made to import Odoo CSV's and give a nice invoice in 4 languages and 2 currencies. Converted during time to a stand alone.

How to start:
You will need a free account on https://fixer.io/ for currency conversion.
copy .env.example to .env and fill in as you need.
You can also pass ENV vars as docker variables. (docker env vars ovverrule .env file vars)

docker-compose.yml is for production
docker-compose-dev.yml for dev


Originally made in 2015
after the upgrade to node16, I decided to move the repo to github.
