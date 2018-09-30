const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const spies = require('chai-spies')

const should = chai.should()
const { assert, expect } = chai

chai.use(chaiAsPromised)
chai.use(spies)

global.chai = chai
global.should = should
global.assert = assert
global.expect = expect
