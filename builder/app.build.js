({
    appDir: "../",
    baseUrl: "js",
    dir: "../../Roll20-Macros-build",
    paths: {
        tpl: 'lib/tpl/tpl',
        controller: 'Controllers',
        model: 'Models',
        view: 'Views',
        app: 'lib/application'
    },
    modules: [
        {
            name: "main"
        }
    ],
    optimizeCss: "standard"
})