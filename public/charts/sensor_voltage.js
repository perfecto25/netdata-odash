window.CHARTS = window.CHARTS || {};
window.CHARTS.sensor_voltage = {
  id:             'sensor_voltage',
  title:          'Sensor Voltage',
  sub:            'system.hw.sensor.voltage.input',
  unit:           'V',
  endpoint:       '/sensordata',
  chartPrefix:    'voltage',
  requires:       'sensor.voltage',
  colors:         [],
  nav:            { group: 'Sensors', section: 'Voltage' },
};
