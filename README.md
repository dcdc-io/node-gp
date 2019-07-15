# node-gp

A get the job done node.js library for interacting with GlobalPlatform devices. You can use node-gp to manage a GlobalPlatform device on any major desktop OS without any external dependencies.

## Background 

node-gp was created to make smartcard development accessible to more people and more platforms. 

Smartcard development is hard and the existing tools will leave you wondering why you ever bothered*. Given that there are overwhelmingly more smartcards in the world than there are smartphones - **your passport, debit card, and sim card are smartcards** - we figured we should make programming this type of device feel less like stepping in dogshit with new shoes on the way to a job interview you're already late to, and instead more like typing "npm install" and hitting return.

_*There are notable exceptions to this trend like the fantastic [GlobalPlatformPro](https://github.com/martinpaljak/GlobalPlatformPro) from [Martin Paljak](https://github.com/martinpaljak). If you're doing a lot of smartcard work you'll want to GlobalPlatformPro in your toolkit._

The rising interest in decentralised apps, blockchains, distributed ledgers, IoT, and so on, has driven the need for small, low power, low cost and normal person usable cryptography. Smartcard devices like the tiny chip in your bank card give you portable cryptographic computation and very secure key storage without both the [bullshit of charging batteries](https://www.macworld.co.uk/how-to/apple/improve-apple-watch-battery-life-3609928/) and the [inexplicable paying for 1U of LEDs and aluminium](https://medium.com/@simonvc/hsms-are-bullshit-imho-f9f736e1e5f2). We think these smartcard devices are so important that to not have made an easy-to-use programmer would have been criminal on our part.

### Global Platform

We're using the 2.1.1 specification as a reference for this implementation, and we're not anticipating that we will cover it to a large extent. We're interested in basic installing and deleting applets as far as Global Platform goes. Anything else we need will be added case by case when it's worth anybody's time to do it.

You can get more information about the specification at the [official site](https://globalplatform.org/specs-library/).


## Building

node-gp is a typescript project and we're using yarn as a package manager. If you would prefer just javascript and npm then we'll defend our decision not to for €80+ p/h.

To install dependencies and build run:

`yarn rebuild`

## Usage

