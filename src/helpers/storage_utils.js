function getData(name) {
  const data = localStorage.getItem(name);

  if ( !data ) {
    return null;
  }

  return JSON.parse(data);
}

function setData(name, data) {
  if ( !localStorage.setItem(name, JSON.stringify(data)) ) {
    return false;
  }

  return true;
}

export { getData, setData };
