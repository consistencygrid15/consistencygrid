const https = require('https');
https.get('https://consistencygrid.com/api/wallpaper-data?token=fu5UVNoHQw6ZknLLdpDaIc:APA91bFAIWn9XzAmRIYgudrfHLuU1T7EPQ8u0expowJgjPCDhWaxng3JEC8uS7b0W-pDimRLqm5itXgur04WP5UN_5Vs4MB9keTOz2ILo2EnCtXbEjn01XI', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const json = JSON.parse(d);
    console.log(JSON.stringify(json, null, 2));
  });
});
