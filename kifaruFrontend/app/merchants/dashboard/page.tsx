
"use client";

import React, { useEffect,useState} from "react";
import axios from "axios";
// import jwt_decode from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import {
  Layout,
  Menu,
  Button,
  Modal,
  Input,
  InputNumber,
  Upload,
  Table,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  DollarOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import WalletSetupModal from "../../utilis/WalletSetupModal"; // Adjust the import path as necessary
import { log } from "console";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

const MerchantDashboard: React.FC = () => {
const [walletModalVisible, setWalletModalVisible] = useState(false);
const [savedWalletAddress, setSavedWalletAddress] = useState("");
const [merchantusername, setMerchantUsername] = useState("User");
const [merchant_id, setMerchantId] = useState("0 merchant_id");

  const [collapsed, setCollapsed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    quantity: 0,
    imageFile: null as File | null,
    imagePreview: "",
  });


 const handleMenuClick = (e: any) => {
  if (e.key === "my Wallet") {
    setWalletModalVisible(true);
  }
  // else handle other menu clicks...
};

  const resetForm = () => {
    setForm({ name: "", price: 0, quantity: 0, imageFile: null, imagePreview: "" });
  };

  const handleAddClick = () => {
    resetForm();
    setModalVisible(true);
  };

  // axios save products to backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post("http://localhost:5050/AddProduct");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        message.error("Failed to load products.");
      }
    };

    fetchProducts();
  }, []);




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  };

  const handlePriceChange = (value: number | null) => {
    setForm((prev) => ({ ...prev, price: value ?? 0 }));
  };

  const handleStockChange = (value: number | null) => {
    setForm((prev) => ({ ...prev, quantity: value ?? 0 }));
  };

  const handleImageChange = (info: any) => {
    if (info.file.status === "removed") {
      setForm((prev) => ({ ...prev, imageFile: null, imagePreview: "" }));
      return;
    }
    if (info.file.originFileObj) {
      const file = info.file.originFileObj;
      const preview = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, imageFile: file, imagePreview: preview }));
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return isImage && isLt2M;
  };

const handleOk = async () => {
  const { name, price, quantity, imageFile } = form;

  const errors = [];
  if (!name.trim()) errors.push("Product name is required.");
  if (price <= 0) errors.push("Price must be greater than 0.");
  if (quantity <= 0) errors.push("Quantity must be greater than 0.");
  if (!imageFile) errors.push("Product image is required.");

  if (errors.length > 0) {
    message.error(errors.join(" "));
    return;
  }

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY; // Add API key

    if (!cloudName || !uploadPreset || !apiKey) {
      throw new Error("Cloudinary configuration is missing. Check environment variables.");
    }

    // Step 1: Upload to Cloudinary
    const uploadData = new FormData();
    uploadData.append("file", imageFile);
    uploadData.append("upload_preset", uploadPreset);
    uploadData.append("api_key", apiKey); // Required for unsigned uploads

console.log("Env vars:", {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
});
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    if (!cloudinaryRes.ok) {
      const errorData = await cloudinaryRes.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || cloudinaryRes.statusText}`);
    }

    const result = await cloudinaryRes.json();
    const imageUrl = result.secure_url;
    console.log("Cloudinary response:", result);
    console.log("Image URL:", imageUrl);

    // Step 2: Send product info with imageUrl to your backend
    const productPayload = {
      merchant_id,
      name,
      price,
      quantity,
      imageUrl,
    };

    const response = await axios.post("http://localhost:5050/AddProduct", productPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    message.success("Product added successfully!");
    console.log("Server response:", response.data);

    setModalVisible(false);
    setForm({
      name: "",
      price: 0,
      quantity: 0,
      imageFile: null,
      imagePreview: "",
    });
  } catch (err) {
    if (err?.response) {
      message.error(`Server error: ${err.response.data.message || "Unknown error"}`);
    } else {
      message.error(`Failed to add product: ${err.message || "Check the network or console."}`);
    }
    console.error("POST error:", err);
  }
};

  const handleDelete = (id: number) => {
    if (confirm("Delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url: string) => (
        <img src={url} alt="product" style={{ height: 50, borderRadius: 6 }} />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Product) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          Delete
        </Button>
      ),
    },
  ];


 useEffect(() => {
    const token = localStorage.getItem("merchantToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const decoded :any= jwtDecode(token);
        const user = decoded.merchantUserName || decoded.merchantusername || decoded.sub || "User";
        const merchant_id =decoded.merchant_id || decoded.merchant_id || decoded.sub || "Unknown merchant_id";
        setMerchantUsername(user);
        setMerchantId(merchant_id);
        console.log("Merchant ID:", merchant_id);
        console.log("Decoded user:", user);
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }
  }, []);

  
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #D8B4FE, #C084FC, #A78BFA)", 

      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark" style={{ position: "fixed", left: 20, top: 90, bottom: 20,borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>

        <div
          style={{
            height: 64,
            color: "white",
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
            marginTop:25, 
            marginBottom: 20,

          }}
        >
          {/* Merchant */}
          </div>
           <Menu
           theme="dark"
           defaultSelectedKeys={["dashboard"]}
           mode="inline"
           onClick={handleMenuClick}
           className="spaced-menu"
           items={[
             { key: "dashboard", icon: <ShopOutlined />, label: "Dashboard" },
             { key: "Clients", icon: <UserOutlined />, label: "Clients" },
             { key: "my Wallet", icon: <DollarOutlined />, label: "My Wallet" },
           ]}
          />

      </Sider>

      <Layout>
        {/* Fixed Navbar */}
     <Header
  style={{
    position: "fixed",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 100,
    paddingLeft: 24,
    padding: 24,
    backgroundColor: "#111827", // Tailwind gray-900
    boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
    height: 64,
    display: "flex",
    marginBottom: 20,
    justifyContent: "space-between",  // <-- change this to space-between
    alignItems: "center",
  }}
>
  <Title level={4} style={{ color: "white", margin: 30, userSelect: "none" }}>
    Welcome, {merchantusername}
  </Title>

  <button
    onClick={() => {
      localStorage.removeItem("merchantToken");
      window.location.href = "/";
    }}
    style={{
      backgroundColor: "transparent",
      border: "3px solid white",
      color: "white",
      marginRight: "30px",
      padding: "2px",
      borderRadius: 30,
      cursor: "pointer",
      maxHeight: 60,
      marginTop: "10px",
      minWidth: 120,
  
      
      fontWeight: "bold",
    }}
  >
    Logout
  </button>
</Header>


        {/* Below navbar: cards + add button row */}
        <Content
          style={{
            marginTop: 130, 
            marginLeft: 250,
            marginRight: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              marginBottom: 24,
              userSelect: "none",
            }}
          >
            {/* Left: Cards */}
            <div style={{ display: "flex", gap: 34, minWidth: 700 }}>
              {[
                { title: "View Transactions", icon: <DollarOutlined /> },
                { title: "View Orders", icon: <ShopOutlined /> },
                { title: "Analytics", icon: <UserOutlined /> },
              ].map((card) => (
                  <div
                   key={card.title}
                   className="shadow-lg rounded-lg p-6 bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer hover:bg-green-700 transition-colors flex items-center space-x-4"
                   style={{ color: "black",  flex: "0 0 250px",   height: 150, }}
                 >

                  <div
                    style={{
                      fontSize: 28,
                      color: "limegreen",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {card.icon}
                  </div>
                  <div className="font-semibold text-lg">{card.title}</div>
                </div>
              ))}
            </div>

            {/* Right: Add Product button */}
            <Button
              size="large"
             style={{
               background: "#047857", // green-700
               color: "white",
               fontWeight: "600",
               padding: "30px",
                fontSize: 16,
               borderRadius: 10,
               boxShadow: "0 2px 6px rgba(4, 120, 87, 0.7)",
               border: "none",
               marginRight: 120,
               transition: "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
             }}
              onClick={handleAddClick}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Add Product
            </Button>
          </div>

          {/* Product Table */}
          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 }}
            bordered={false}
          />

          {/* Add Product Modal */}
         <Modal
            title="Add New Product"
           open={modalVisible}
           onOk={handleOk}
           onCancel={() => setModalVisible(false)}
          maskClosable={false}  // Prevent closing on outside click
          cancelButtonProps={{style: { backgroundColor: 'red',color: 'white',border: 'none',fontSize: 20,padding: '22px',marginRight: 25}}}    
           okButtonProps={{ style: { backgroundColor: '#047857', borderColor: '#047857', color: 'white',fontSize: 20,padding: '22px'}}}
           okText="Save Product"
           destroyOnHidden
           width={800}
           styles={{
             body: {
               minHeight: "320px",  
               overflowY: "auto",
          padding: "24px 32px",
        },
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label className="block font-semibold mb-2">Product Name</label>
      <Input
        placeholder="Enter product name"
        name="name"
        value={form.name}
        onChange={handleInputChange}
        style={{ height: 44, fontSize: 16, padding: "0 12px" }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <label className="block font-semibold mb-2">Price (KSH.)</label>
      <InputNumber
        placeholder="Enter price"
        value={form.price}
        onChange={handlePriceChange}
        min={0}
        style={{ width: "100%", height: 44, fontSize: 16 }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <label className="block font-semibold mb-2">Stock/Quantity</label>
      <InputNumber
        placeholder="Enter quantity"
        value={form.quantity}
        onChange={handleStockChange}
        min={0}
        style={{ width: "100%", height: 44, fontSize: 16 }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <label className="block font-semibold mb-2">Product Image</label>
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        onChange={handleImageChange}
        accept="image/*"
      >
        <Button icon={<UploadOutlined />} style={{ height: 44, fontSize: 16 }}>
          Upload Product Image
        </Button>
      </Upload>
      {form.imagePreview && (
        <img
          src={form.imagePreview}
          alt="Preview"
          style={{
            marginTop: 16,
            height: 120,
            width: 120,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
      )}
    </div>
  </div>
</Modal>

<WalletSetupModal
  visible={walletModalVisible}
  onClose={() => setWalletModalVisible(false)}
  onSubmit={(address) => {
    setSavedWalletAddress(address);
    message.success("Wallet saved successfully!");
    setWalletModalVisible(false);
    console.log("Saved wallet:", address); 
  }}
/>




        </Content>
      </Layout>
    </Layout>
  );
};

export default MerchantDashboard;






