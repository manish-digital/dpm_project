// const glob = require('glob'); 

// const Router = require('express').Router ; 
// const VERSION = process.env.API_VER ; 

// module.exports = () => glob

//     .sync('**/*.js', { cwd: `${__dirname}/`+VERSION+'/routes/' })

//     .map(filename => require(`./`+VERSION+'/routes/'+`${filename}`))

//     .filter(router => Object.getPrototypeOf(router) == Router)
 

//     .reduce((rootRouter, router) => rootRouter.use(router), Router({ mergeParams: true }))




const glob = require('glob'); 
const Router = require('express').Router;
const VERSION = process.env.API_VER || 'v1'; // Default to v1 if not set

module.exports = () => {
  try {
    const routeFiles = glob.sync('**/*.js', { cwd: `${__dirname}/${VERSION}/routes/` });
    
    const routers = routeFiles
      .map(filename => {
        try {
          const router = require(`./${VERSION}/routes/${filename}`);
          if (Object.getPrototypeOf(router) !== Router) {
            throw new Error(`Invalid router module: ${filename}`);
          }
          return router;
        } catch (err) {
          console.error(`Failed to load router module: ${filename}`, err);
          return null; // Skip invalid router files
        }
      })
      .filter(Boolean); // Remove any null values from failed router loads

    return routers.reduce((rootRouter, router) => rootRouter.use(router), Router({ mergeParams: true }));

  } catch (err) {
    console.error('Failed to load routes:', err);
    throw err; // Rethrow or handle based on your needs
  }
};
