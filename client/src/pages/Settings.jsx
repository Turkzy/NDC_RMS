import React, { useState, useEffect } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Plus, Trash, Trash2, X, Check } from "lucide-react";
import api, { endpoints } from "../config/api";
import Swal from "sweetalert2";

const Settings = () => {
  // State management
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [itemCodes, setItemCodes] = useState([]);

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showItemCodeModal, setShowItemCodeModal] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingItemCode, setEditingItemCode] = useState(null);

  // Form states
  const [itemForm, setItemForm] = useState({ itemName: "", itemId: "" });
  const [locationForm, setLocationForm] = useState({ locationName: "" });
  const [accountForm, setAccountForm] = useState({
    username: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [itemCodeForm, setItemCodeForm] = useState({ itemCode: "" });

  // Fetch data on mount
  useEffect(() => {
    fetchItems();
    fetchLocations();
    fetchAccounts();
    fetchRoles();
    fetchItemCodes();
  }, []);

  // ==================== FETCH OPERATIONS ====================
  const fetchItems = async () => {
    try {
      const res = await api.get(endpoints.items.getAllItems);
      if (res.data.error === false && res.data.data) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      toast.error("Failed to fetch items. Please try again.");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get(endpoints.locations.getAllLocations);
      // LocationController returns { locations } directly
      if (res.data.locations) {
        setLocations(res.data.locations);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      toast.error("Failed to fetch locations. Please try again.");
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get(endpoints.user.getUsers);
      if (res.data.error === false && res.data.users) {
        setAccounts(res.data.users);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      toast.error("Failed to fetch accounts. Please try again.");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get(endpoints.rbac.getRoles);
      if (res.data.error === false && res.data.roles) {
        setRoles(res.data.roles);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchItemCodes = async () => {
    try {
      const res = await api.get(endpoints.items.getAllItemsCode);
      if (res.data.error === false && res.data.data) {
        setItemCodes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching item codes:", err);
    }
  };

  // ==================== ITEMS CRUD ====================
  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(endpoints.items.createItem, itemForm);
      if (res.data.error === false) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="text-green-600" />
            Created Successfully!
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Bounce,
            icon: false,
          }
        );
        setShowItemModal(false);
        setItemForm({ itemName: "", itemId: "" });
        fetchItems();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create item.");
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        endpoints.items.updateItem(editingItem.id),
        itemForm
      );
      if (res.data.error === false) {
        toast.info(
          <div className="flex items-center gap-2">
            <Pencil className="text-blue-600" />
            Updated Successfully!
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Bounce,
            icon: false,
          }
        );
        setShowItemModal(false);
        setEditingItem(null);
        setItemForm({ itemName: "", itemId: "" });
        fetchItems();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update item.");
    }
  };

  const handleDeleteItem = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete"
    })
    if (result.isConfirmed) {
      try {
        const res = await api.delete(endpoints.items.deleteItem(id));
        toast.error(
          <div className="flex items-center gap-2">
            <Trash2 className="text-red-600" />
            Deleted Successfully!
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Bounce,
            icon: false,
          }
        );
        fetchItems();
      } catch (err) {
        console.error("Error deleting item:", err);
        toast.error(err.response?.data?.message || "Failed to delete item.");
      }
    }
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      itemName: item.itemName,
      itemId: item.itemId?.toString() || "",
    });
    setShowItemModal(true);
  };

  // ==================== ITEM CODES CRUD ====================
  const handleCreateItemCode = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(endpoints.items.createItemsCode, itemCodeForm);
      if (res.data.error === false) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="text-green-600" />
            Created Successfully!
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Bounce,
            icon: false,
          }
        );
        setShowItemCodeModal(false);
        setItemCodeForm({ itemCode: "" });
        fetchItemCodes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create item code.");
    }
  };

  const handleUpdateItemCode = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        endpoints.items.updateItemsCode(editingItemCode.id),
        itemCodeForm
      );
      if (res.data.error === false) {
        toast.info(
          <div className="flex items-center gap-2">
            <Pencil className="text-blue-600" />
            Updated Successfully!
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Bounce,
            icon: false,
          }
        );
        setShowItemCodeModal(false);
        setEditingItemCode(null);
        setItemCodeForm({ itemCode: "" });
        fetchItemCodes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update item code.");
    }
  };

  const handleDeleteItemCode = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete"
    })
    if (result.isConfirmed) {
      try {
        const res = await api.delete(endpoints.items.deleteItemsCode(id));
        toast.error(
          <div className="flex items-center gap-2">
            <Trash2 className="text-red-600" />
            Deleted Successfully!
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Bounce,
            icon: false,
          }
        );
        fetchItemCodes();
      } catch (err) {
        console.error("Error deleting item code:", err);
        toast.error(err.response?.data?.message || "Failed to delete item code.");
      }
    }
  };

  const openEditItemCode = (itemCode) => {
    setEditingItemCode(itemCode);
    setItemCodeForm({ itemCode: itemCode.itemCode });
    setShowItemCodeModal(true);
  };

  // ==================== LOCATIONS CRUD ====================
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        endpoints.locations.createLocation,
        locationForm
      );
      if (res.status === 201) {
        toast.success("Created successfully!");
        setShowLocationModal(false);
        setLocationForm({ locationName: "" });
        fetchLocations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create location.");
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        endpoints.locations.updateLocation(editingLocation.id),
        locationForm
      );
      if (res.status === 200) {
        toast.info("Updated Successfully!");
        setShowLocationModal(false);
        setEditingLocation(null);
        setLocationForm({ locationName: "" });
        fetchLocations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update location.");
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;
    try {
      const res = await api.delete(endpoints.locations.deleteLocation(id));
      if (res.status === 200) {
        toast.error("Deleted Successfully!");
        fetchLocations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete location.");
    }
  };

  const openEditLocation = (location) => {
    setEditingLocation(location);
    setLocationForm({ locationName: location.locationName });
    setShowLocationModal(true);
  };

  // ==================== ACCOUNTS CRUD ====================
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(endpoints.auth.register, {
        ...accountForm,
        roleId: Number(accountForm.roleId),
      });
      if (res.data.error === false) {
        toast.success("Account created successfully!");
        setShowAccountModal(false);
        setAccountForm({ username: "", email: "", password: "", roleId: "" });
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account.");
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(endpoints.user.update(editingAccount.id), {
        ...accountForm,
        roleId: accountForm.roleId ? Number(accountForm.roleId) : undefined,
      });
      if (res.data.error === false) {
        toast.info("Updated Successfully!");
        setShowAccountModal(false);
        setEditingAccount(null);
        setAccountForm({ username: "", email: "", password: "", roleId: "" });
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update account.");
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;
    try {
      const res = await api.delete(endpoints.user.delete(id));
      if (res.data.error === false) {
        toast.error("Deleted Successfully!");
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account.");
    }
  };

  const openEditAccount = (account) => {
    setEditingAccount(account);
    setAccountForm({
      username: account.username,
      email: account.email,
      password: "",
      roleId: account.roleId?.toString() || "",
    });
    setShowAccountModal(true);
  };

  // Reset modals
  const resetModals = () => {
    setShowItemModal(false);
    setShowLocationModal(false);
    setShowAccountModal(false);
    setShowItemCodeModal(false);
    setEditingItem(null);
    setEditingLocation(null);
    setEditingAccount(null);
    setEditingItemCode(null);
    setItemForm({ itemName: "", itemId: "" });
    setLocationForm({ locationName: "" });
    setAccountForm({ username: "", email: "", password: "", roleId: "" });
    setItemCodeForm({ itemCode: "" });
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : "Unknown";
  };

  return (
    <div className="select-none">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <div className="bg-white p-4 rounded-xl shadow-md mb-8">
        <h1 className="text-3xl font-semibold font-montserrat text-gray-600 mb-8 text-center">
          Dropdown Settings
        </h1>
        <div className="grid grid-cols-2 gap-20 mb-10">
          {/* ITEMS SECTION */}
          <div className="col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold font-montserrat text-gray-600 mb-4">
                Items
              </h2>
              <button
                onClick={() => {
                  resetModals();
                  setShowItemModal(true);
                }}
                className="flex items-center gap-2 bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
              >
                <Plus size={16} className="h-4 w-4" />
                Add Item
              </button>
            </div>
            <div className="overflow-x-auto border rounded-md overflow-hidden">
              <div className="max-h-[380px] overflow-y-auto">
                <table className="min-w-full table-auto text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="font-montserrat text-sm text-gray-800">
                      <th className="px-2 py-1 text-center">Item Name</th>
                      <th className="px-2 py-1 text-center">Item Code</th>
                      <th className="px-2 py-1 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-2 text-center text-gray-500"
                        >
                          No items found
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition font-montserrat text-sm text-gray-500 even:bg-slate-100"
                        >
                          <td className="px-4 py-2 text-center text-gray-500">
                            {item.itemName}
                          </td>
                          <td className="px-4 py-2 text-center text-gray-500">
                            {item.itemCode?.itemCode || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-center flex items-center gap-2 justify-center">
                            <button
                              onClick={() => openEditItem(item)}
                              className="bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-red-100 text-red-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ITEM CODE SECTION */}
          <div className="col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold font-montserrat text-gray-600 mb-4">
                Item Codes
              </h2>
              <button
                onClick={() => {
                  resetModals();
                  setShowItemCodeModal(true);
                }}
                className="flex items-center gap-2 bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
              >
                <Plus size={16} className="h-4 w-4" />
                Add Item Code
              </button>
            </div>
            <div className="overflow-x-auto border rounded-md overflow-hidden">
              <div className="max-h-[380px] overflow-y-auto">
                <table className="min-w-full table-auto text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="font-montserrat text-sm text-gray-800">
                      <th className="px-2 py-1 text-center">Item Code</th>
                      <th className="px-2 py-1 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200 font-montserrat text-sm text-gray-500">
                    {itemCodes.length === 0 ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-4 py-4 text-center text-gray-500"
                        >
                          No item codes found
                        </td>
                      </tr>
                    ) : (
                      itemCodes.map((itemCode) => (
                        <tr
                          key={itemCode.id}
                          className="hover:bg-slate-50 transition font-montserrat text-sm text-gray-500 even:bg-slate-100"
                        >
                          <td className="px-4 py-2 text-center text-gray-500">
                            {itemCode.itemCode}
                          </td>
                          <td className="px-4 py-2 text-center flex items-center gap-2 justify-center">
                            <button
                              onClick={() => openEditItemCode(itemCode)}
                              className="bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItemCode(itemCode.id)}
                              className="bg-red-100 text-red-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-20">
          {/* LOCATIONS SECTION */}
          <div className="col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold font-montserrat text-gray-600 mb-4">
                Locations
              </h2>
              <button
                onClick={() => {
                  resetModals();
                  setShowLocationModal(true);
                }}
                className="flex items-center gap-2 bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
              >
                <Plus size={16} className="h-4 w-4" />
                Add Location
              </button>
            </div>
            <div className="overflow-x-auto border rounded-md overflow-hidden">
              <div className="max-h-[380px] overflow-y-auto">
                <table className="min-w-full table-auto text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="font-montserrat text-sm text-gray-800">
                      <th className="px-2 py-1 text-center">Location</th>
                      <th className="px-2 py-1 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {locations.length === 0 ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-2 py-4 text-center text-gray-500"
                        >
                          No locations found
                        </td>
                      </tr>
                    ) : (
                      locations.map((location) => (
                        <tr
                          key={location.id}
                          className="hover:bg-slate-50 transition font-montserrat text-sm text-gray-500 even:bg-slate-100"
                        >
                          <td className="px-4 py-2 text-center text-gray-500">
                            {location.locationName}
                          </td>
                          <td className="px-4 py-2 text-center flex items-center gap-2 justify-center">
                            <button
                              onClick={() => openEditLocation(location)}
                              className="bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(location.id)}
                              className="bg-red-100 text-red-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACCOUNTS SECTION */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold font-montserrat text-gray-600 mb-8 text-center">
            Account Settings
          </h1>
          <button
            onClick={() => {
              resetModals();
              setShowAccountModal(true);
            }}
            className="flex items-center gap-2 bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
          >
            <Plus size={16} className="h-4 w-4" />
            Add Account
          </button>
        </div>
        <div className="overflow-x-auto border rounded-md overflow-hidden">
          <div className="max-h-[380px] overflow-y-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr className="font-montserrat text-sm text-gray-800">
                  <th className="px-2 py-1 text-center">Username</th>
                  <th className="px-2 py-1 text-center">Email</th>
                  <th className="px-2 py-1 text-center">Role</th>
                  <th className="px-2 py-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-2 py-4 text-center text-gray-500"
                    >
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) => (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-50 transition font-montserrat text-sm text-gray-500 even:bg-slate-100"
                    >
                      <td className="px-4 py-2 text-center text-gray-500">
                        {account.username}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-500">
                        {account.email}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-500">
                        {getRoleName(account.roleId)}
                      </td>
                      <td className="px-4 py-2 text-center flex items-center gap-2 justify-center">
                        <button
                          onClick={() => openEditAccount(account)}
                          className="bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="bg-red-100 text-red-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-[50rem] w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold font-montserrat text-gray-600">
                {editingItem ? "Edit Item" : "Add Item"}
              </h3>
              <button
                onClick={resetModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemForm.itemName}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, itemName: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
                  Item Code
                </label>
                <select
                  value={itemForm.itemId}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, itemId: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="" className="font-montserrat text-gray-600">Select Item Code</option>
                  {itemCodes.map((code) => (
                    <option key={code.id} value={code.id} className="font-montserrat text-gray-600">
                      {code.itemCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetModals}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-[50rem] w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold font-montserrat text-gray-600">
                {editingLocation ? "Edit Location" : "Add Location"}
              </h3>
              <button
                onClick={resetModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={
                editingLocation ? handleUpdateLocation : handleCreateLocation
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={locationForm.locationName}
                  onChange={(e) =>
                    setLocationForm({
                      ...locationForm,
                      locationName: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetModals}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                >
                  {editingLocation ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-[50rem] w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold font-montserrat text-gray-600">
                {editingAccount ? "Edit Account" : "Add Account"}
              </h3>
              <button
                onClick={resetModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={
                editingAccount ? handleUpdateAccount : handleCreateAccount
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={accountForm.username}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, username: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required={!editingAccount}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, email: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required={!editingAccount}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
                  Password {editingAccount && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={accountForm.password}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, password: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required={!editingAccount}
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">Role</label>
                <select
                  value={accountForm.roleId}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, roleId: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="" className="font-montserrat text-gray-600">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="font-montserrat text-gray-600">
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetModals}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                >
                  {editingAccount ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM CODE MODAL */}
      {showItemCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-[50rem] w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold font-montserrat text-gray-600">
                {editingItemCode ? "Edit Item Code" : "Add Item Code"}
              </h3>
              <button
                onClick={resetModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={
                editingItemCode ? handleUpdateItemCode : handleCreateItemCode
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
                  Item Code
                </label>
                <input
                  type="text"
                  value={itemCodeForm.itemCode}
                  onChange={(e) =>
                    setItemCodeForm({
                      ...itemCodeForm,
                      itemCode: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetModals}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                >
                  {editingItemCode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
