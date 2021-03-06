import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const createUser = async (name, email, password) => {
  await api.post('/users', {
    name,
    email,
    password,
  });
};

export const sessionAuth = async (email, password) => {
  const { data } = await api.post('/sessions', {
    email,
    password,
  });

  return data;
};

export const listUrls = async (token) => {
  const auth = `Bearer ${token}`;
  const { data } = await api.get('/urls', {
    headers: { Authorization: auth },
  });

  if (!data) return;

  return data;
};

export const deleteUrl = async (id, token) => {
  const auth = `Bearer ${token}`;
  try {
    await api.delete(`/urls/${id}`, {
      headers: { Authorization: auth },
    });
  } catch (e) {
    console.log(e.message);
  }
};

export const createUrl = async (
  token,
  {
    title,
    full_url,
    scheduling_type,
    start_expires_date,
    end_expires_date,
    hour,
  }
) => {
  const auth = `Bearer ${token}`;
  let contentData;

  if (scheduling_type === 'date') {
    contentData = {
      title,
      full_url,
      scheduling_type,
      start_expires_date: start_expires_date._d,
      end_expires_date: end_expires_date._d,
    };
  } else if (scheduling_type === 'hour') {
    contentData = {
      title,
      full_url,
      scheduling_type,
      start_hour: hour.start_hour,
      end_hour: hour.end_hour,
    };
    console.log(contentData);
  } else {
    contentData = {
      title,
      full_url,
    };
  }
  const { data } = await api.post('/urls', contentData, {
    headers: { Authorization: auth },
  });
  return data;
};

export const detailsUrl = async (token, { id }) => {
  const auth = `Bearer ${token}`;

  const { data } = await api.get(`/urls/${id}`, {
    headers: { Authorization: auth },
  });

  if (!data) return;
  return data;
};
