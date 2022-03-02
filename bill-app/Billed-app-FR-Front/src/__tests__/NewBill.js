/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import {screen, waitFor, getByTestId, fireEvent} from "@testing-library/dom"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { ROUTES } from "../constants/routes";
import router from "../app/Router.js";
window.alert = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
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
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})


// test d'intégration POST
// describe("Given I am a user connected as an employee", () => {
//   describe("When I navigate to Bills", () => {
//     test("add bill to mock API POST", async () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html

//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname })
//       }
//      const testBill =
//       {
//         "id": "BeKy598729423xZ",
//         "vat": "30",
//         "amount": 150,
//         "name": "test post newbill",
//         "fileName": "15927.jpeg",
//         "commentary": "test post newbill",
//         "pct": 30,
//         "type": "Transports",
//         "email": "a@a",
//         "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a798b",
//         "date": "2022-02-14",
//         "status": "pending",
//         "commentAdmin": "en fait non"
//       }

//        const getSpy = jest.spyOn(mockStore, "bills") // fonction simulée qui surveille l'appel de la méthode post de l'objet store
//        const bill = await mockStore.create(testBill)
//        expect(getSpy).toHaveBeenCalledTimes(1)
//        expect(bill.status).toBe("pending")
//        expect(bill.id).toBe("BeKy598729423xZ")


//     })
//   })
// })