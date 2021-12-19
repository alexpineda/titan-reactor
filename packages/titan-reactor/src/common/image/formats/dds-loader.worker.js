import { DDSLoader } from "./dds-loader";

onmessage = function ({ data }) {
  const { buf, id } = data;

  const ddsLoader = new DDSLoader();
  const result = ddsLoader.parse(buf, true);

  postMessage({ id, result });
};
