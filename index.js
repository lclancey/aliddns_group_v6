import { RPCClient } from "@alicloud/pop-core";
import axios from "axios";
import { devices, DomainName,accessKey } from "./config.js";
var client = new RPCClient(
  Object.assign(accessKey, {
    endpoint: "http://dns.aliyuncs.com",
    apiVersion: "2015-01-09",
  })
);
let records = await client.request("DescribeDomainRecords", { DomainName }, {});

let remotePrefix = records.DomainRecords.Record.find(
  (record) => record.RR === devices[0].RR
)
  .Value.replace("::", ":0000:0000:0000:")
  .match(/^\w+(:\w+){3,3}/g)[0];

let localPrefix = (
  await axios.request({
    url: "http://ipv6.ipqi.co",
  })
).data.address
  .replace("::", ":0000:0000:0000:")
  .match(/^\w+(:\w+){3,3}/g)[0];

if (remotePrefix !== localPrefix) {
  devices.forEach((device) => {
    client.request("UpdateDomainRecord", {
      RecordId: device.RecordId,
      RR: device.RR,
      Type: "AAAA",
      Value: `${localPrefix}:${device.EUI64}`,
    });
  });
}
