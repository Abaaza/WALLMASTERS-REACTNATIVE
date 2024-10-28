import base64 from "base-64";

const decodeToken = (token) => {
  const payload = token.split(".")[1]; // Extract payload from JWT
  return JSON.parse(base64.decode(payload)); // Decode payload
};

export default decodeToken;
