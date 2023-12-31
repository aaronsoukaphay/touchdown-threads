import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { BsCart } from 'react-icons/bs';
import { FaSearch } from 'react-icons/fa';
import { Row, Col, Container } from 'react-bootstrap';
import './Header.css';
import { useEffect, useState, useContext } from 'react';
import CartContext from './CartContext';
import { Team } from './Catalog';

export default function Header() {
  const { items, setToken } = useContext(CartContext);
  const { teamId } = useParams();
  const [team, setTeam] = useState<Team>();
  const [error, setError] = useState<unknown>();
  const navigate = useNavigate();

  let totalQuantity = 0;
  items.forEach((item) => (totalQuantity += item.quantity));

  useEffect(() => {
    async function getTeamInfo() {
      setError(undefined);
      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const teamInfo = await response.json();
        setTeam(teamInfo);
      } catch (err: any) {
        console.log(err.message);
        setError(err);
      }
    }
    if (teamId) {
      getTeamInfo();
    } else {
      setTeam(undefined);
    }
  }, [teamId]);

  if (error) {
    console.error('Fetch error:', error);
    return (
      <p>Error! {error instanceof Error ? error.message : 'Unknown Error'}</p>
    );
  }

  function handleAccount() {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
      setToken(undefined);
      navigate('/');
      console.log('User signed out');
    } else {
      navigate('/sign-in');
    }
  }

  function handleSubmit(event) {
    const form = event.target;
    const formData = new FormData(form);

    const formJson = Object.fromEntries(formData.entries());
    formJson.search
      ? navigate(`/search/${formJson.search}`)
      : event.preventDefault();
  }

  return (
    <div>
      <TopBanner
        team={team}
        handleAccount={() => handleAccount()}
        quantity={totalQuantity}
      />
      <BottomBanner team={team} handleSubmit={(e) => handleSubmit(e)} />
      <NavBar team={team} />
      <Outlet />
    </div>
  );
}

function TopBanner({ team, handleAccount, quantity }) {
  return (
    <Container fluid>
      <Row className="justify-content-between align-items-center py-2 mx-3">
        <Col xs={7} className="px-0">
          {team && (
            <a href="/" className="text-decoration-none text-dark">
              <h3 className="topBannerName my-0">TOUCHDOWN THREADS</h3>
            </a>
          )}
        </Col>
        <Col className="px-2 d-flex justify-content-end">
          <a href="#" onClick={handleAccount} className="text-dark me-3">
            <p className="m-0 account">
              {localStorage.getItem('token') ? 'Sign Out' : 'Sign In'}
            </p>
          </a>
          {localStorage.getItem('token') && (
            <Link to={`/cart`}>
              <div className="cart">
                <BsCart style={{ color: 'black' }} size={20} />
                {quantity > 0 && (
                  <div className="cartNumber text-decoration-none">
                    {quantity}
                  </div>
                )}
              </div>
            </Link>
          )}
        </Col>
      </Row>
    </Container>
  );
}

function BottomBanner({ team, handleSubmit }) {
  const backgroundColor = team ? team.bannerColor : 'rgb(244,245,245)';
  return (
    <div style={{ backgroundColor: backgroundColor }}>
      <Container fluid>
        <Row
          className="align-items-center py-2 justify-content-around"
          xs="auto">
          {team ? (
            <Col
              className="d-flex justify-content-center"
              xs={6}
              sm={5}
              md={4}
              lg={3}
              xl={2}>
              <img src={team.teamLogo} className="img-fluid" width="75%" />
            </Col>
          ) : (
            <Col className="d-flex justify-content-center">
              <a href="/" className="text-decoration-none text-dark">
                <h2 className="bottomBannerName m-2">touchdown threads</h2>
              </a>
            </Col>
          )}
          <Col className="d-flex justify-content-center">
            <form onSubmit={handleSubmit}>
              <FaSearch className="me-2" />
              <input
                placeholder="Search products..."
                name="search"
                type="search"
                className="p-1 rounded border-1 border-black searchBar"
              />
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function NavBar({ team }) {
  const navItems = ['home', 'jerseys', 'men', 'women'];
  const backgroundColor = team ? team.navColor : 'rgb(54,52,54)';
  return (
    <div style={{ backgroundColor: backgroundColor }}>
      <Container>
        <Row
          className="py-2 text-uppercase justify-content-evenly align-items-center"
          md="auto">
          {navItems.map((navItem, index) => (
            <Col className="text-center" key={index}>
              <a
                href={navItem === 'home' ? '/' : `/catalog/${navItem}`}
                className="text-decoration-none navName">
                {navItem}
              </a>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
