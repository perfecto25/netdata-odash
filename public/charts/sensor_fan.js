window.CHARTS = window.CHARTS || {};
window.CHARTS.sensor_fan = {
  id:             'sensor_fan',
  title:          'Sensor Fan Speed',
  sub:            'system.hw.sensor.fan.input',
  unit:           'RPM',
  endpoint:       '/sensordata',
  chartPrefix:    'fan',
  requires:       'sensor.fan',
  colors:         [],
  nav:            { group: 'Sensors', section: 'Fan' },
};
