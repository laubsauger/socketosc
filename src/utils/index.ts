import os from 'os';

const getIPAddresses = () => {
  const interfaces = os.networkInterfaces();
  const ipAddresses = [];

  if (!interfaces) {
    console.log('No network interfaces reported');
    throw new Error('No network interfaces reported');
  }

  for (let deviceName in interfaces) {
    const addresses = interfaces[deviceName];

    if (!addresses || !addresses.length) {
      console.log('No addresses found for interface', deviceName);
      return [];
    }

    for (let i = 0; i < addresses.length; i++) {
      const addressInfo = addresses[i];
      if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }

  return ipAddresses;
}

export {
  getIPAddresses
};