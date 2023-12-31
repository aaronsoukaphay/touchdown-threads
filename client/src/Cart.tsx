import { useContext } from 'react';
import { DropdownButton, Dropdown, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CartContext from './CartContext';

export default function Cart() {
  const { items, setItems, error, setError } = useContext(CartContext);
  const navigate = useNavigate();
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const quantities = [1, 2, 3, 4, 5];

  let subtotal = 0;

  items.forEach((item) => (subtotal += item.price * item.quantity));
  const taxes = subtotal * 0.0725;
  const total = subtotal + taxes;

  let totalQuantity = 0;
  items.forEach((item) => (totalQuantity += item.quantity));

  if (error) {
    console.error('Fetch error:', error);
    return (
      <p>Error! {error instanceof Error ? error.message : 'Unknown Error'}</p>
    );
  }

  async function updateCart(cartId: number, size: string, quantity: number) {
    try {
      const request = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ size, quantity }),
      };
      const response = await fetch(`/api/carts/${cartId}`, request);
      if (!response.ok) throw new Error(`HTTP error!: ${response.status}`);
      const newCart = await response.json();
      if (newCart) console.log('Cart has been updated!:', newCart);
      const updatedCart = items.map((i) =>
        i.cartId === cartId ? { ...i, size, quantity } : i
      );
      setItems(updatedCart);
    } catch (err: any) {
      console.log(err.message);
      setError(err);
    }
  }

  async function deleteCart(cartId: number) {
    try {
      const request = {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      await fetch(`/api/carts/${cartId}`, request);
      const updatedCart = items.filter((item) => item.cartId !== cartId);
      setItems(updatedCart);
    } catch (err: any) {
      console.log(err.message);
      setError(err);
    }
  }

  async function handleCheckout() {
    if (!items[0]) {
      window.alert(
        "There is nothing in your cart. Don't forget to add something before you checkout!"
      );
      return;
    }
    try {
      const request = {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      };
      await fetch('/api/clear-cart', request);
      const emptyCart = [];
      setItems(emptyCart);
      navigate('/checkout');
    } catch (err: any) {
      console.log(err.message);
      setError(err.message);
    }
  }

  return (
    <Container>
      <Row className="mt-3 justify-content-between mb-5">
        <Col lg={7}>
          <h2>Order Details</h2>
          <div className="mb-2">Thank you for shopping with us!</div>
          <Row className="border-bottom py-2 mt-3 fw-bold text-center justify-content-between d-none d-sm-flex">
            <Col xs={3} sm={2} lg={2}>
              Product
            </Col>
            <Col xs={5} md={5} lg={6}>
              Description
            </Col>
            <Col xs={1} lg={2}>
              Quantity
            </Col>
            <Col className="text-center">Subtotal</Col>
          </Row>
          {!items[0] && (
            <Container className="my-4">
              <Row className="text-center">
                <Col>Your Shopping cart is currently empty</Col>
              </Row>
              <Row className="text-center mt-2">
                <Col>
                  <button
                    onClick={() => navigate('/')}
                    className="border-1 rounded px-3 py-2">
                    Continue Shopping
                  </button>
                </Col>
              </Row>
            </Container>
          )}
          {items.map((item, index) => (
            <Row
              key={index}
              className="py-2 border-bottom justify-content-between">
              <Col
                className="text-center align-self-center"
                xs={3}
                sm={2}
                lg={2}>
                <img src={item.productImage} width="100%" />
              </Col>
              <Col xs={5} md={5} lg={6} className="p-0">
                <p className="m-0">{item.productName}</p>
                <DropdownButton
                  className="py-3"
                  id="dropdown-basic-button"
                  size="sm"
                  variant="secondary"
                  title={item.size}>
                  {sizes.map((size, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={() =>
                        updateCart(item.cartId, size, item.quantity)
                      }>
                      {size}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </Col>
              <Col xs={1} lg={2} className="p-0">
                <DropdownButton
                  className="py-2 text-center"
                  id="dropdown-basic-button"
                  size="sm"
                  variant="secondary"
                  title={item.quantity}>
                  {quantities.map((quantity, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={() =>
                        updateCart(item.cartId, item.size, quantity)
                      }>
                      {quantity}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </Col>
              <Col className="d-flex flex-column justify-content-between align-items-center">
                <div>{`$${(item.price * item.quantity).toFixed(2)}`}</div>
                <a
                  href="#"
                  onClick={() => deleteCart(item.cartId)}
                  className="link-dark">
                  Remove
                </a>
              </Col>
            </Row>
          ))}
        </Col>
        <Col lg={4} className="my-4">
          <h3 className="mb-4">Order Summary</h3>
          <div className="d-flex flex-column">
            <div className="d-flex">
              <div className="me-auto">
                Subtotal
                {totalQuantity > 0 &&
                  ` (${totalQuantity} ${totalQuantity > 1 ? 'items' : 'item'})`}
              </div>
              <div>{`$${subtotal.toFixed(2)}`}</div>
            </div>
            <div className="d-flex py-3">
              <div className="me-auto">Taxes</div>
              <div>{`$${taxes.toFixed(2)}`}</div>
            </div>
            <div className="d-flex py-4 border-top">
              <h4 className="me-auto">Total</h4>
              <div>{`$${total.toFixed(2)}`}</div>
            </div>
            <button
              style={{ height: '3rem' }}
              onClick={handleCheckout}
              className="border-1 rounded">
              Checkout
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
