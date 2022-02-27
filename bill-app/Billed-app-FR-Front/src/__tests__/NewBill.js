/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {screen, waitFor, getByTestId, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { ROUTES } from "../constants/routes";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("I am on the NewBill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })

    test("When I want to upload a file, handleChangeFile is called", () =>
    {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage : window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const uploadButton = screen.getByTestId("file");
      expect(uploadButton).toBeDefined();
      uploadButton.addEventListener('click', handleChangeFile);
      fireEvent.click(uploadButton);
      expect(handleChangeFile).toHaveBeenCalled();
    })

    test("handleSubmit is called when form is submitted",() =>
    {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage : window.localStorage
      })
      expect(newBill).toBeDefined();
      console.log(newBill);
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
