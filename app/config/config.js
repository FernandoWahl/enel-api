module.exports = {
    jwt: {
        secret: "37e92d6b44c931bdd9f8b6aef2f8f58d",
        expiresIn: "48h"
    },
    server: {
        port:40002,
        urlPrefix: '/enel',
    },
    enel: {
        url: "https://portalhome.eneldistribuicaosp.com.br/api",
        firebase: "/firebase/login",
        getloginv2: "/sap/getloginv2",
        usagehistory: "/sap/usagehistory",
        portalinfo: "/sap/portalinfo",
        monthAnalisys: "/sap/monthAnalisys",
        getbilldetail: "/sap/getbilldetail",
        generatepdf: "/sap/generatepdf"
    },
    googleapi: {
        url: "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=AIzaSyAz4JxNF3rij5N0Y2gsATBV8amYMtC3Mzk"
    },
    logs: {
        level : "debug"
    }
}