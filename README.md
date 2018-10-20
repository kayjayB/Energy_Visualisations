# University of the Witwatersrand Resource Analytics and Visualisations

[![Build Status](https://travis-ci.com/kayjayB/Energy_Visualisations.svg?token=C89zFG2E1x82oWUrCB78&branch=master)](https://travis-ci.com/kayjayB/Energy_Visualisations)

This repository contains the code base for a resource visualisations website that is hosted as an Azure App service. The website can be accessed [here](https://energy-analytics.azurewebsites.net)

To run the project locally run:

`node index`

To run this system on a local device, an OpenTSDB database needs to be configured, and the IP address of the database must be used as the host for the OpenTSDB client in `mainRoutes.js`

## Energy Visualisation Demonstration
![Website demonstration](Documentation/Site_Demo/Demo.png)
