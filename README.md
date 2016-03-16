# angular-date
Simple &amp; useful, native date manipulation library for Angular 1.x

====

Docs coming soon, meanwhile, use the source, luke. :)


## 5-second install:

```js
angular.module('YourModuleName', ['ngDate'])
```

## Usage example:

```js
angular.module('YourModuleName', ['ngDate'])
.controller('YourController', function ($date, $log) {
  $log.debug('it is currently:', $date.now())
});
```