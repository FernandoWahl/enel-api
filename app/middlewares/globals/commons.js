const cors = require('cors')
const express = require('express')
const compression = require('compression')

/** @param { import('express').Express} app */
module.exports = app => {
    app.use(cors())
    app.use(compression())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    return this
}