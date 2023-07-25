/** @param { import('express').Express } app */
module.exports = app => {
    let _login = {};
    let _data = {};

    this.getLogin = () => _login
    this.setLogin = (login) => _login = login
    this.getData = () => _data
    this.setData = (data) => _data = data

    return this
};