require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Kết nối MongoDB thành công!');
};

// ============================
// SCHEMAS
// ============================
const userSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  phone: String, role: { type: String, default: 'user' },
  isEmailVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  addresses: [{ label: String, fullName: String, phone: String, street: String, ward: String, district: String, city: String, isDefault: Boolean }],
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: String, description: String, image: String,
  slug: String, isActive: { type: Boolean, default: true }, sortOrder: Number,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String, description: String, price: Number,
  salePrice: { type: Number, default: 0 }, onSale: { type: Boolean, default: false },
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: Number, sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }, numReviews: { type: Number, default: 0 },
  tags: [String], isActive: { type: Boolean, default: true }, slug: String,
}, { timestamps: true });

const couponSchema = new mongoose.Schema({
  code: String, description: String, discountType: String, discountValue: Number,
  maxDiscount: Number, minOrderValue: Number, usageLimit: Number,
  usedCount: { type: Number, default: 0 }, startDate: Date, endDate: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User     = mongoose.model('User',     userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product  = mongoose.model('Product',  productSchema);
const Coupon   = mongoose.model('Coupon',   couponSchema);

const toSlug = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now();

// ============================
// ẢNH HOA THẬT TỪ UNSPLASH
// ============================
const IMG = {
  hongDo:       'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600',
  hongPhan:     'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
  hongTrang:    'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600',
  hopHongPastel:'https://images.unsplash.com/photo-1487530811015-780780943f3f?w=600',
  hoaCauTay:    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
  hoaCuoi2:     'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
  trangTriCuoi: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600',
  sinhNhat1:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
  sinhNhat2:    'https://images.unsplash.com/photo-1612540139150-4b6a96fce68e?w=600',
  gioSinhNhat:  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600',
  khaiTruong1:  'https://images.unsplash.com/photo-1490750967868-88df5691cc11?w=600',
  langHoa:      'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600',
  chiaBuon:     'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600',
  voHoa:        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600',
  hopQua:       'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600',
  gioQua:       'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600',
  hoaSocola:    'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=600',
  dongTien:     'https://images.unsplash.com/photo-1444930694458-01babf71abda?w=600',
  cucVang:      'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=600',
  huongDuong:   'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600',
  lavender:     'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=600',
  gioHoa1:      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600',
  gioHoa2:      'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600',
};

// ============================
// SEED USERS
// ============================
const seedUsers = async () => {
  const pw = await bcrypt.hash('123456', 12);
  await User.insertMany([
    { name: 'Admin Flower Shop', email: 'admin@flowershop.com', password: pw, phone: '0901234567', role: 'admin',
      addresses: [{ label: 'Văn phòng', fullName: 'Admin Flower Shop', phone: '0901234567', street: '123 Nguyễn Huệ', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true }] },
    { name: 'Lê Văn Quý', email: 'quy@flowershop.com', password: pw, phone: '0912345678', role: 'user',
      addresses: [{ label: 'Nhà', fullName: 'Lê Văn Quý', phone: '0912345678', street: '456 Lê Lợi', ward: 'Phường 3', district: 'Quận 5', city: 'TP. Hồ Chí Minh', isDefault: true }] },
    { name: 'Nguyễn Văn Đức', email: 'duc@flowershop.com', password: pw, phone: '0923456789', role: 'user',
      addresses: [{ label: 'Nhà', fullName: 'Nguyễn Văn Đức', phone: '0923456789', street: '789 Trần Hưng Đạo', ward: 'Phường 7', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true }] },
    { name: 'Nguyễn Thị Lan', email: 'lan@gmail.com', password: pw, phone: '0934567890', role: 'user',
      addresses: [{ label: 'Nhà', fullName: 'Nguyễn Thị Lan', phone: '0934567890', street: '12 Võ Văn Tần', ward: 'Phường 6', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true }] },
    { name: 'Trần Văn Nam', email: 'nam@gmail.com', password: pw, phone: '0945678901', role: 'user' },
  ]);
  console.log('✅ Đã tạo 5 users');
};

// ============================
// SEED CATEGORIES
// ============================
const seedCategories = async () => {
  const cats = [
    { name: 'Hoa Hồng',           sortOrder: 1, image: IMG.hongDo,       description: 'Các loại hoa hồng tươi — biểu tượng của tình yêu và sự lãng mạn. Hồng đỏ, hồng phấn, hồng trắng đa dạng mẫu mã.' },
    { name: 'Hoa Cưới',           sortOrder: 2, image: IMG.hoaCauTay,    description: 'Hoa trang trí đám cưới, hoa cầm tay cô dâu, hoa cài áo chú rể và trang trí sân khấu bàn tiệc.' },
    { name: 'Hoa Sinh Nhật',      sortOrder: 3, image: IMG.sinhNhat1,    description: 'Bó hoa, giỏ hoa và hộp hoa tươi dành tặng sinh nhật. Nhiều mẫu từ bình dân đến cao cấp.' },
    { name: 'Hoa Khai Trương',    sortOrder: 4, image: IMG.khaiTruong1,  description: 'Lẵng hoa, kệ hoa chúc mừng khai trương, tân gia, lễ động thổ. Thiết kế sang trọng ý nghĩa.' },
    { name: 'Hoa Chia Buồn',      sortOrder: 5, image: IMG.chiaBuon,     description: 'Vòng hoa, bó hoa chia buồn trang nghiêm, thể hiện sự thành kính với người đã khuất.' },
    { name: 'Quà Tặng Hoa',       sortOrder: 6, image: IMG.hopQua,       description: 'Hộp quà hoa kết hợp gấu bông, socola, nước hoa. Đóng gói sang trọng phù hợp mọi dịp.' },
    { name: 'Hoa Tươi Hàng Ngày', sortOrder: 7, image: IMG.cucVang,      description: 'Hoa tươi giá tốt cho mọi ngày — cúc, đồng tiền, hướng dương, lavender.' },
    { name: 'Giỏ Hoa',            sortOrder: 8, image: IMG.gioHoa1,      description: 'Giỏ hoa tươi đa dạng mẫu mã, phù hợp thăm hỏi và tặng quà dịp lễ tết.' },
  ];
  const result = await Category.insertMany(cats.map(c => ({ ...c, slug: toSlug(c.name) })));
  console.log('✅ Đã tạo 8 danh mục');
  return result;
};

// ============================
// SEED PRODUCTS
// ============================
const seedProducts = async (categories) => {
  const getCat = (name) => categories.find(c => c.name === name)?._id;
  const products = [
    // HOA HỒNG
    { name: 'Bó Hoa Hồng Đỏ 20 Bông', price: 350000, salePrice: 299000, onSale: true, stock: 50,
      images: [IMG.hongDo, IMG.hopHongPastel], category: getCat('Hoa Hồng'),
      tags: ['hoa hồng đỏ', 'tình yêu', 'valentine'],
      description: 'Bó hoa hồng đỏ nhung tươi thắm gồm 20 bông hoa hồng cao cấp. Tượng trưng cho tình yêu nồng nàn và sự chân thành. Phù hợp tặng người yêu, kỷ niệm ngày cưới, Valentine. Kèm giấy gói và ruy băng lụa.' },
    { name: 'Hộp Hoa Hồng Pastel Mix', price: 450000, stock: 30,
      images: [IMG.hopHongPastel, IMG.hongPhan], category: getCat('Hoa Hồng'),
      tags: ['hộp hoa', 'pastel', 'quà tặng'],
      description: 'Hộp hoa hồng pastel mix 4 màu nhẹ nhàng: hồng phấn, trắng, tím lavender và vàng kem. Thiết kế hộp sang trọng hình tròn, phù hợp tặng bạn gái, mẹ, cô giáo.' },
    { name: 'Bó Hoa Hồng Trắng Tinh Khôi', price: 280000, stock: 40,
      images: [IMG.hongTrang, IMG.hongPhan], category: getCat('Hoa Hồng'),
      tags: ['hoa hồng trắng', 'thuần khiết', 'tri ân'],
      description: 'Bó hoa hồng trắng tinh khôi 15 bông, biểu tượng của sự thuần khiết và chân thành. Phù hợp tri ân thầy cô, chúc mừng tốt nghiệp.' },
    { name: 'Bó Hoa Hồng Phấn Lãng Mạn', price: 380000, salePrice: 320000, onSale: true, stock: 45,
      images: [IMG.hongPhan, IMG.hongDo], category: getCat('Hoa Hồng'),
      tags: ['hoa hồng phấn', 'lãng mạn'],
      description: 'Bó hoa hồng phấn 25 bông kết hợp baby trắng và lá bạc hà. Màu hồng phấn ngọt ngào thể hiện sự dịu dàng và yêu thương.' },

    // HOA CƯỚI
    { name: 'Hoa Cầm Tay Cô Dâu Classic', price: 800000, stock: 20,
      images: [IMG.hoaCauTay, IMG.hoaCuoi2], category: getCat('Hoa Cưới'),
      tags: ['hoa cô dâu', 'đám cưới', 'classic'],
      description: 'Bó hoa cầm tay cô dâu phong cách cổ điển với hoa hồng trắng, baby trắng và ruy băng lụa trắng ngà. Thiết kế vừa tay, thanh lịch cho ngày trọng đại.' },
    { name: 'Hoa Cầm Tay Cô Dâu Hiện Đại', price: 950000, stock: 15,
      images: [IMG.hoaCuoi2, IMG.hoaCauTay], category: getCat('Hoa Cưới'),
      tags: ['hoa cô dâu', 'hiện đại', 'thác nước'],
      description: 'Bó hoa cầm tay cô dâu phong cách hiện đại kiểu thác nước với hoa hồng đỏ và lan trắng. Phù hợp cô dâu cá tính, sang trọng.' },
    { name: 'Set Hoa Trang Trí Bàn Tiệc Cưới', price: 1500000, stock: 10,
      images: [IMG.trangTriCuoi, IMG.hoaCauTay], category: getCat('Hoa Cưới'),
      tags: ['trang trí', 'tiệc cưới', 'set hoa'],
      description: 'Set hoa trang trí bàn tiệc cưới gồm 10 bình hoa nhỏ phối hồng pastel và trắng cho 10 bàn tiệc. Tạo không gian lãng mạn và ấm cúng.' },

    // HOA SINH NHẬT
    { name: 'Bó Hoa Sinh Nhật Rực Rỡ', price: 320000, salePrice: 280000, onSale: true, stock: 60,
      images: [IMG.sinhNhat1, IMG.sinhNhat2], category: getCat('Hoa Sinh Nhật'),
      tags: ['sinh nhật', 'hướng dương', 'rực rỡ'],
      description: 'Bó hoa sinh nhật đầy màu sắc gồm hoa hướng dương vàng, hoa cúc tím, baby trắng. Kèm thiệp chúc mừng viết tay miễn phí.' },
    { name: 'Giỏ Hoa Sinh Nhật Luxury', price: 650000, stock: 25,
      images: [IMG.gioSinhNhat, IMG.sinhNhat2], category: getCat('Hoa Sinh Nhật'),
      tags: ['sinh nhật', 'luxury', 'gấu bông'],
      description: 'Giỏ hoa sinh nhật cao cấp phối hoa hồng đỏ, lan hồ điệp, cẩm tú cầu tím. Tặng kèm gấu bông Teddy 30cm và thiệp sinh nhật cao cấp.' },
    { name: 'Hộp Hoa Sinh Nhật Surprise', price: 480000, stock: 30,
      images: [IMG.sinhNhat2, IMG.gioSinhNhat], category: getCat('Hoa Sinh Nhật'),
      tags: ['sinh nhật', 'surprise', 'bất ngờ'],
      description: 'Hộp hoa bất ngờ đặc biệt — mở nắp hoa nổi lên tạo hiệu ứng wow. Gồm 12 bông hồng mix màu và baby trắng. Cực kỳ ấn tượng.' },

    // HOA KHAI TRƯƠNG
    { name: 'Lẵng Hoa Khai Trương Phú Quý', price: 1200000, salePrice: 999000, onSale: true, stock: 20,
      images: [IMG.khaiTruong1, IMG.langHoa], category: getCat('Hoa Khai Trương'),
      tags: ['khai trương', 'lẵng hoa', 'sang trọng'],
      description: 'Lẵng hoa khai trương với hoa địa lan vàng, hoa hồng đỏ và lá xanh. Kèm băng rôn chữ vàng "Chúc Mừng Khai Trương". Cao 1.2m, đặt trước cửa hàng, showroom.' },
    { name: 'Kệ Hoa Chúc Mừng Tân Gia', price: 850000, stock: 25,
      images: [IMG.langHoa, IMG.khaiTruong1], category: getCat('Hoa Khai Trương'),
      tags: ['tân gia', 'nhà mới', 'kệ hoa'],
      description: 'Kệ hoa tươi 2 tầng chúc mừng tân gia với hoa hồng cam, hoa cúc vàng và lá nhiệt đới. Kèm băng rôn "Chúc Mừng Tân Gia".' },

    // HOA CHIA BUỒN
    { name: 'Vòng Hoa Chia Buồn Trắng', price: 800000, stock: 15,
      images: [IMG.chiaBuon, IMG.voHoa], category: getCat('Hoa Chia Buồn'),
      tags: ['chia buồn', 'vòng hoa', 'tang lễ'],
      description: 'Vòng hoa chia buồn với hoa trắng tinh khiết, thể hiện sự thành kính và tiếc thương. Đường kính 1m, kèm băng vải đen trang trọng.' },
    { name: 'Bó Hoa Chia Buồn Trang Nghiêm', price: 450000, stock: 20,
      images: [IMG.voHoa, IMG.chiaBuon], category: getCat('Hoa Chia Buồn'),
      tags: ['chia buồn', 'hoa huệ', 'tang lễ'],
      description: 'Bó hoa chia buồn gồm hoa huệ trắng, cúc trắng và lá xanh. Thiết kế trang nghiêm thể hiện lòng thành kính với người đã khuất.' },

    // QUÀ TẶNG HOA
    { name: 'Hộp Quà Hoa Hồng + Gấu Bông', price: 550000, salePrice: 499000, onSale: true, stock: 35,
      images: [IMG.hopQua, IMG.hoaSocola], category: getCat('Quà Tặng Hoa'),
      tags: ['quà tặng', 'gấu bông', 'socola', 'valentine'],
      description: 'Hộp quà lãng mạn gồm 10 bông hồng đỏ + gấu bông Teddy 30cm + 9 viên socola Ferrero Rocher. Hộp đen sang trọng với nơ đỏ. Tặng người yêu ngày Valentine, kỷ niệm.' },
    { name: 'Giỏ Quà Hoa + Trái Cây Nhập Khẩu', price: 720000, stock: 20,
      images: [IMG.gioQua, IMG.hopQua], category: getCat('Quà Tặng Hoa'),
      tags: ['quà tặng', 'trái cây', 'thăm hỏi'],
      description: 'Giỏ quà tươi ngon gồm hoa hồng mix + táo đỏ Mỹ, nho đen Úc, dâu tây Đà Lạt. Phù hợp thăm hỏi bệnh nhân, chúc mừng sinh con.' },
    { name: 'Set Hoa + Nước Hoa Mini', price: 680000, stock: 25,
      images: [IMG.hoaSocola, IMG.gioQua], category: getCat('Quà Tặng Hoa'),
      tags: ['quà tặng', 'nước hoa', '8/3', '20/10'],
      description: 'Set quà đặc biệt gồm hộp 6 bông hồng phấn + nước hoa mini 5ml + thiệp viết tay. Quà ý nghĩa cho phụ nữ ngày 8/3, 20/10.' },

    // HOA TƯƠI HÀNG NGÀY
    { name: 'Bó Hoa Đồng Tiền Mix Màu', price: 150000, stock: 100,
      images: [IMG.dongTien, IMG.cucVang], category: getCat('Hoa Tươi Hàng Ngày'),
      tags: ['hoa đồng tiền', 'giá rẻ', 'tươi lâu'],
      description: 'Bó hoa đồng tiền mix 5 màu tươi sáng: đỏ, vàng, cam, hồng, tím. Tươi lâu 7-10 ngày, phù hợp cắm bình để bàn làm việc.' },
    { name: 'Bó Hoa Cúc Vàng 20 Bông', price: 120000, stock: 80,
      images: [IMG.cucVang, IMG.dongTien], category: getCat('Hoa Tươi Hàng Ngày'),
      tags: ['hoa cúc', 'cúc vàng', 'may mắn'],
      description: 'Bó hoa cúc vàng tươi 20 bông to tròn đều đặn. Màu vàng tượng trưng may mắn và thịnh vượng. Tươi lâu 10-14 ngày nếu thay nước đều.' },
    { name: 'Bó Hoa Hướng Dương Rực Rỡ', price: 180000, stock: 70,
      images: [IMG.huongDuong, IMG.cucVang], category: getCat('Hoa Tươi Hàng Ngày'),
      tags: ['hướng dương', 'lạc quan', 'năng động'],
      description: 'Bó hoa hướng dương tươi 10 bông, biểu tượng lạc quan và năng lượng tích cực. Trang trí nhà cửa hoặc tặng bạn bè để truyền năng lượng.' },
    { name: 'Bó Hoa Lavender Tím Thơm', price: 95000, stock: 90,
      images: [IMG.lavender, IMG.dongTien], category: getCat('Hoa Tươi Hàng Ngày'),
      tags: ['lavender', 'thơm', 'tím', 'thư giãn'],
      description: 'Bó hoa lavender tím nhỏ xinh thơm ngát, giúp thư giãn và dễ ngủ. Hoa khô giữ hương thơm nhiều tháng. Trang trí phòng ngủ rất đẹp.' },

    // GIỎ HOA
    { name: 'Giỏ Hoa Tươi Mix Xuân Hè', price: 420000, stock: 30,
      images: [IMG.gioHoa1, IMG.gioHoa2], category: getCat('Giỏ Hoa'),
      tags: ['giỏ hoa', 'mix', 'mùa xuân'],
      description: 'Giỏ hoa tươi mix với hoa hồng cam, hướng dương mini, baby và lá nhiệt đới. Giỏ tre thủ công mỹ nghệ tái sử dụng được.' },
    { name: 'Giỏ Hoa Lan Hồ Điệp Cao Cấp', price: 950000, salePrice: 850000, onSale: true, stock: 20,
      images: [IMG.gioHoa2, IMG.gioHoa1], category: getCat('Giỏ Hoa'),
      tags: ['giỏ hoa', 'lan hồ điệp', 'cao cấp', 'tặng sếp'],
      description: 'Giỏ hoa lan hồ điệp trắng cao cấp trong giỏ mây đan tay. Hoa lan tươi lâu 3-4 tuần. Tặng sếp, đối tác, người lớn tuổi rất sang trọng.' },
  ];

  const result = await Product.insertMany(products.map(p => ({ ...p, slug: toSlug(p.name) })));
  console.log(`✅ Đã tạo ${result.length} sản phẩm có ảnh thật`);
};

// ============================
// SEED COUPONS
// ============================
const seedCoupons = async () => {
  const now = new Date();
  const days = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  await Coupon.insertMany([
    { code: 'WELCOME10',  description: 'Giảm 10% đơn đầu tiên — tối đa 50.000đ',         discountType: 'percent', discountValue: 10,  maxDiscount: 50000,  minOrderValue: 200000, usageLimit: 100, startDate: now, endDate: days(90) },
    { code: 'FLOWER50K',  description: 'Giảm thẳng 50.000đ cho đơn từ 300.000đ',           discountType: 'fixed',   discountValue: 50000,                     minOrderValue: 300000, usageLimit: 50,  startDate: now, endDate: days(60) },
    { code: 'SALE20HOA',  description: 'Giảm 20% đơn từ 500.000đ — tối đa 100.000đ',      discountType: 'percent', discountValue: 20,  maxDiscount: 100000, minOrderValue: 500000, usageLimit: 30,  startDate: now, endDate: days(30) },
    { code: 'FREESHIP',   description: 'Miễn phí giao hàng nội thành cho đơn từ 200.000đ', discountType: 'fixed',   discountValue: 30000,                     minOrderValue: 200000, usageLimit: 500, startDate: now, endDate: days(180) },
    { code: 'VALENTINE25',description: 'Valentine — Giảm 25% tối đa 150.000đ',             discountType: 'percent', discountValue: 25,  maxDiscount: 150000, minOrderValue: 400000, usageLimit: 200, startDate: now, endDate: days(365) },
  ]);
  console.log('✅ Đã tạo 5 mã giảm giá');
};

// ============================
// CHẠY SEED
// ============================
const seedAll = async () => {
  try {
    await connectDB();
    console.log('\n🗑️  Xoá data cũ...');
    await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}), Coupon.deleteMany({})]);
    console.log('✅ Đã xoá\n🌱 Đang tạo data mẫu...\n');
    await seedUsers();
    const cats = await seedCategories();
    await seedProducts(cats);
    await seedCoupons();
    console.log('\n🎉 SEED THÀNH CÔNG!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 flower_gift_shop:');
    console.log('   users      : 5   │  categories : 8');
    console.log('   products   : 22  │  coupons    : 5');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 admin@flowershop.com  / 123456  (admin)');
    console.log('👤 quy@flowershop.com    / 123456  (user)');
    console.log('👤 duc@flowershop.com    / 123456  (user)');
    console.log('🎫 WELCOME10 | FLOWER50K | FREESHIP | SALE20HOA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed thất bại:', err.message);
    process.exit(1);
  }
};

seedAll();