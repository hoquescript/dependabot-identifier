function storeOffset(offset: number) {
  localStorage.setItem("offset", offset.toString());
}

export default storeOffset;
