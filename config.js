const config = {
   port: process.env.PORT || 4000,
   mongoPath:"secret"
};

const items = [
   {
      id: 1,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 2,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 3,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 4,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 5,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 6,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 7,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 8,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 9,
      taken: false,
      license: '',
      user: ''
   },
   {
      id: 10,
      taken: false,
      license: '',
      user: ''
   },
]

module.exports = {
   config: config,
   items: items,
   mongoPath:config.mongoPath
}
