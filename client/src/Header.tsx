import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, Outlet, useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { BsCart } from 'react-icons/bs';
// import { FaSearch } from 'react-icons/fa';
import './Header.css';
import { useEffect, useState } from 'react';

export default function Header() {
  const { teamId } = useParams();
  const [team, setTeam] = useState();
  const [error, setError] = useState<any>();

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

  return (
    <div>
      <TopBanner team={team} />
      <BottomBanner team={team} />
      <NavBar team={team} />
      <Outlet />
    </div>
  );
}

function TopBanner({ team }) {
  return (
    <div className="d-flex align-items-center">
      <div className="me-auto ps-4 pageName">{team && 'TOUCHDOWN THREADS'}</div>
      <div className="p-2">
        <Link to="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
      <div className="mx-4">
        <Link to="/cart/customer/1">
          <BsCart />
        </Link>
      </div>
    </div>
  );
}

function BottomBanner({ team }) {
  const backgroundColor = team ? team.bannerColor : 'rgb(244,245,245)';
  return (
    <div
      className="d-flex justify-content-around align-items-center py-4"
      style={{ backgroundColor: backgroundColor }}>
      <div className="pageName text-dark">
        {team ? (
          <img src={team.teamLogo} width="60%" className="img-fluid " />
        ) : (
          'TOUCHDOWN THREADS'
        )}
      </div>
      <div className="me-2">
        <div className="form">
          {/* <FaSearch /> */}
          <input
            type="text"
            className="form-control form-input"
            placeholder="Search products..."
          />
        </div>
      </div>
    </div>
  );
}

function NavBar({ team }) {
  const backgroundColor = team ? team.navColor : 'rgb(54,52,54)';
  return (
    <div
      className="d-flex py-2 navName text-uppercase justify-content-evenly align-items-center"
      style={{ backgroundColor: backgroundColor }}>
      <Link className="text-light text-decoration-none" to="/">
        Home
      </Link>
      <Link className="text-light text-decoration-none" to="/catalog/Jersey">
        Jerseys
      </Link>
      <Link className="text-light text-decoration-none" to="/catalog/men">
        <div>Men</div>
      </Link>
      <Link className="text-light text-decoration-none" to="/catalog/women">
        <div>Women</div>
      </Link>
    </div>
  );
}
