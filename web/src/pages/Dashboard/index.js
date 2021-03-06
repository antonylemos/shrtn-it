import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';

import useTheme from '../../utils/useTheme';

import { listUrls, deleteUrl } from '../../services/api';

import useUser from '../../utils/useUser';

import { createUrl, detailsUrl } from '../../services/api';

import formatDateHour from '../../utils/formatDateHour';

import Header from '../../components/Header';
import Title from '../../components/Title';
import Button from '../../components/Button';
import Jumbotron from '../../components/Jumbotron';
import ModalCreateUrl from '../../components/ModalCreateUrl';

import {
  FiPlus as PlusIcon,
  FiSearch as SearchIcon,
  FiTrash2 as TrashIcon,
  FiExternalLink as ExternalLinkIcon,
  FiBarChart2 as BarCharIcon,
} from 'react-icons/fi';

import * as S from './styles';

const Dashboard = () => {
  const { theme } = useTheme();

  const [hideModal, setHideModal] = useState(true);

  const [urls, setUrls] = useState([
    {
      id: 0,
      title: '',
      short_url: '',
    },
  ]);

  const [stateModal, setStateModal] = useState({
    title: '',
    full_url: '',
  });

  const [stateButtonModal, setStateButtonModal] = useState(false);

  const [detailUrl, setDetailUrl] = useState({
    id: '',
    title: '',
    short_url: '',
    clicks: 0,
  });

  const [date, setDate] = useState({
    startDate: null,
    endDate: null,
  });
  const [hour, setHour] = useState({
    start_hour: '',
    end_hour: '',
  });

  const [scheduling_type, setScheduling_type] = useState('');

  const [loadingJumbo, setLoadingJumbo] = useState(false);

  const [loadingDeleteUrl, setLoadingDeleteUrl] = useState(false);

  const [searchUrl, setSearchUrl] = useState('');
  const { user } = useUser();
  useEffect(() => {
    (async () => {
      const data = await listUrls(user.token);

      setUrls(data);
    })();
  }, [user, setUrls]);

  const handleDeleteUrl = async (id, detail = false) => {
    try {
      setLoadingDeleteUrl(true);
      const newArray = urls.filter((url) => id !== url.id);
      await deleteUrl(id, user.token);
      setLoadingJumbo(false);

      setTimeout(() => {
        setLoadingDeleteUrl(false);
        setUrls(newArray);
        if (detail) {
          setDetailUrl({
            id: '',
            title: '',
            short_url: '',
            clicks: 0,
          });
        }
        toast.dark('Url deletada com sucesso!', {
          autoClose: 2000,
        });
      }, 1000);
    } catch (error) {
      setLoadingDeleteUrl(false);
      toast.error('Erro ao deletar a url', {
        autoClose: 2000,
      });
    }
  };

  const handleFormModalSubmit = async (event) => {
    event.preventDefault();

    const { title, full_url } = stateModal;

    const { startDate, endDate } = date;

    setStateButtonModal(true);

    try {
      const [data] = await createUrl(user.token, {
        title,
        full_url,
        scheduling_type,
        start_expires_date: startDate,
        end_expires_date: endDate,
        hour,
      });

      const newArray = urls;

      newArray.push(data);

      toast.dark('URL criada com sucesso!');
      setUrls(newArray);

      setHideModal(true);
      setStateButtonModal(false);

      setStateModal({
        title: '',
        full_url: '',
      });
      setScheduling_type('');
      setDate({
        startDate: null,
        endDate: null,
      });
      setHour(1);
    } catch (error) {
      toast.error('Erro ao criar a url');
      setStateButtonModal(false);
    }
  };

  const handleShowDetailsUrl = async (id) => {
    setLoadingJumbo(true);

    setDetailUrl({
      id: '',
      title: '',
      short_url: '',
      clicks: 0,
    });
    const data = await detailsUrl(user.token, { id });

    setDetailUrl(data);

    setLoadingJumbo(false);
  };

  const filteredUrls = urls.filter((url) => {
    return url.title.toLowerCase().includes(searchUrl.toLowerCase());
  });

  return (
    <S.Wrapper>
      <Header />
      <S.SectionContent>
        <S.Header>
          <Title weight color={theme.name === 'light' ? 'purple' : 'white'}>
            Dashboard
          </Title>
          <Button
            size="small"
            icon={<PlusIcon size={24} />}
            onClick={() => setHideModal(!hideModal)}
          />
        </S.Header>
        <S.Main>
          <Jumbotron loading={loadingDeleteUrl}>
            <S.HeaderJumbo>
              <h1>Seus Links</h1>
              <S.Search>
                <S.InputSearch
                  type="text"
                  placeholder="Pesquisar..."
                  onChange={(event) => setSearchUrl(event.target.value)}
                />
                <Button size="small" icon={<SearchIcon size={24} />} />
              </S.Search>
            </S.HeaderJumbo>

            {filteredUrls.length === 0 ? (
              <S.NOrFoundUrl>{':('}</S.NOrFoundUrl>
            ) : (
              filteredUrls.map(({ id, title, short_url }) => (
                <S.WrapperLinks key={id} selected={detailUrl.id === id}>
                  <S.ShortenedLink onClick={() => handleShowDetailsUrl(id)}>
                    <h1>{title}</h1>

                    <S.RealLink>
                      <h1>{short_url.replace('http://', '')}</h1>
                    </S.RealLink>
                  </S.ShortenedLink>

                  <S.Icons>
                    <button>
                      <TrashIcon
                        size={16}
                        onClick={() => handleDeleteUrl(id, id === detailUrl.id)}
                      />
                    </button>
                    <button>
                      <a target="_blank" rel="noreferrer" href={short_url}>
                        <ExternalLinkIcon size={16} />
                      </a>
                    </button>
                  </S.Icons>
                </S.WrapperLinks>
              ))
            )}
          </Jumbotron>

          {detailUrl.id !== '' && (
            <Jumbotron>
              <S.HeaderJumboDetails>
                <h1>Detalhes</h1>

                <S.Date>
                  <span>Criado em:</span>

                  <p>{detailUrl.created_at}</p>
                </S.Date>
              </S.HeaderJumboDetails>

              <S.WrapperLinkDetails>
                <S.ShortenedLinkDetail>
                  <h1> {detailUrl.title}</h1>

                  <S.Icons>
                    <button>
                      <TrashIcon
                        size={16}
                        onClick={() => handleDeleteUrl(detailUrl.id, true)}
                      />
                    </button>

                    <button>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={detailUrl.short_url}
                      >
                        <ExternalLinkIcon size={16} />
                      </a>
                    </button>
                  </S.Icons>
                </S.ShortenedLinkDetail>
                <S.RealLinkDetail>
                  <h1>{detailUrl.short_url.replace('http://', '')}</h1>
                  {detailUrl.scheduling_type === 'date' && (
                    <>
                      <p>Data de expiração:</p>
                      <div>
                        <p>
                          Início:{' '}
                          <span>
                            {formatDateHour(
                              detailUrl.start_expires_date,
                              'dd/MM/yyyy'
                            )}
                          </span>
                        </p>
                        <p>
                          Fim:{' '}
                          <span>
                            {formatDateHour(
                              detailUrl.end_expires_date,
                              'dd/MM/yyyy'
                            )}
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                  {detailUrl.scheduling_type === 'hour' && (
                    <>
                      <p>
                        Horário de início:{' '}
                        <span>
                          {formatDateHour(
                            detailUrl.start_expires_hour,
                            "dd/MM/yy 'às' HH:mm:ss"
                          )}
                        </span>
                      </p>
                      <p>
                        Horário de expiração:{' '}
                        <span>
                          {formatDateHour(
                            detailUrl.end_expires_hour,
                            "dd/MM/yy 'às' HH:mm:ss"
                          )}
                        </span>
                      </p>
                    </>
                  )}
                  <p>Estatísticas</p>
                </S.RealLinkDetail>
                <S.ClickStats>
                  <div>
                    <BarCharIcon size={24} /> <h1>{detailUrl.clicks}</h1>
                  </div>

                  <div>
                    <p>Cliques</p>
                  </div>
                </S.ClickStats>
                <S.QrCodeBox>
                  <p>Qr Code</p>
                  <span>Com seu celular escaneie o código abaixo</span>
                  <QRCode
                    value={detailUrl.short_url}
                    renderAs="svg"
                    size={115}
                    bgColor={theme.colors.background.jumboBg}
                    fgColor={theme.colors.stroke.primary}
                    level="Q"
                  />
                </S.QrCodeBox>
              </S.WrapperLinkDetails>
            </Jumbotron>
          )}
          {loadingJumbo && (
            <>
              <S.LoadingJumbo />
            </>
          )}
        </S.Main>
      </S.SectionContent>
      <ModalCreateUrl
        onClick={() => setHideModal(!hideModal)}
        hideModal={hideModal}
        state={stateModal}
        setState={setStateModal}
        handleFormModal={handleFormModalSubmit}
        stateButton={stateButtonModal}
        stateDate={{ date, setDate }}
        scheduling_typeState={{ scheduling_type, setScheduling_type }}
        stateHour={{ hour, setHour }}
      />
    </S.Wrapper>
  );
};

export default Dashboard;
