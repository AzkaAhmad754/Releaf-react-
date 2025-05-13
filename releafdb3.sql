--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_details (
    cartdetailid integer NOT NULL,
    cartid integer,
    itemid integer,
    quantity integer NOT NULL,
    CONSTRAINT cart_details_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_details OWNER TO postgres;

--
-- Name: cart_details_cartdetailid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_details_cartdetailid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_details_cartdetailid_seq OWNER TO postgres;

--
-- Name: cart_details_cartdetailid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_details_cartdetailid_seq OWNED BY public.cart_details.cartdetailid;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    cartid integer NOT NULL,
    userid integer,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: carts_cartid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carts_cartid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_cartid_seq OWNER TO postgres;

--
-- Name: carts_cartid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carts_cartid_seq OWNED BY public.carts.cartid;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    categoryid integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_categoryid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_categoryid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_categoryid_seq OWNER TO postgres;

--
-- Name: categories_categoryid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_categoryid_seq OWNED BY public.categories.categoryid;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    itemid integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    survival_hrs integer,
    picture text,
    trending boolean DEFAULT false,
    stock integer DEFAULT 0,
    nurseryid integer,
    categoryid integer,
    CONSTRAINT items_stock_check CHECK ((stock >= 0)),
    CONSTRAINT items_survival_hrs_check CHECK ((survival_hrs >= 0))
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_itemid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_itemid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_itemid_seq OWNER TO postgres;

--
-- Name: items_itemid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_itemid_seq OWNED BY public.items.itemid;


--
-- Name: nurseries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nurseries (
    nurseryid integer NOT NULL,
    sellerid integer,
    opening_hours time without time zone,
    closing_hours time without time zone,
    delivery_charges numeric
);


ALTER TABLE public.nurseries OWNER TO postgres;

--
-- Name: nurseries_nurseryid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nurseries_nurseryid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nurseries_nurseryid_seq OWNER TO postgres;

--
-- Name: nurseries_nurseryid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nurseries_nurseryid_seq OWNED BY public.nurseries.nurseryid;


--
-- Name: order_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_details (
    orderdetailid integer NOT NULL,
    ordernurseryid integer,
    itemid integer,
    quantity integer NOT NULL,
    price_at_order numeric(10,2) NOT NULL,
    CONSTRAINT order_details_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.order_details OWNER TO postgres;

--
-- Name: order_details_orderdetailid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_details_orderdetailid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_details_orderdetailid_seq OWNER TO postgres;

--
-- Name: order_details_orderdetailid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_details_orderdetailid_seq OWNED BY public.order_details.orderdetailid;


--
-- Name: order_nursery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_nursery (
    ordernurseryid integer NOT NULL,
    orderid integer,
    nurseryid integer,
    subtotal numeric(10,2) DEFAULT 0
);


ALTER TABLE public.order_nursery OWNER TO postgres;

--
-- Name: order_nursery_ordernurseryid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_nursery_ordernurseryid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_nursery_ordernurseryid_seq OWNER TO postgres;

--
-- Name: order_nursery_ordernurseryid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_nursery_ordernurseryid_seq OWNED BY public.order_nursery.ordernurseryid;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    orderid integer NOT NULL,
    userid integer,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_amount numeric(10,2) DEFAULT 0,
    payment_status character varying(50),
    order_status text,
    CONSTRAINT orders_order_status_check CHECK ((order_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_orderid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_orderid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_orderid_seq OWNER TO postgres;

--
-- Name: orders_orderid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_orderid_seq OWNED BY public.orders.orderid;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    paymentid integer NOT NULL,
    orderid integer,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50)
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_paymentid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_paymentid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_paymentid_seq OWNER TO postgres;

--
-- Name: payments_paymentid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_paymentid_seq OWNED BY public.payments.paymentid;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    reviewid integer NOT NULL,
    rating integer,
    description character varying(200) NOT NULL,
    userid integer,
    itemid integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    heading character varying(255) DEFAULT ''::character varying NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_reviewid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_reviewid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_reviewid_seq OWNER TO postgres;

--
-- Name: reviews_reviewid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_reviewid_seq OWNED BY public.reviews.reviewid;


--
-- Name: sellers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sellers (
    sellerid integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    cnic character varying(15) NOT NULL,
    address text,
    password text,
    description text
);


ALTER TABLE public.sellers OWNER TO postgres;

--
-- Name: sellers_sellerid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sellers_sellerid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sellers_sellerid_seq OWNER TO postgres;

--
-- Name: sellers_sellerid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sellers_sellerid_seq OWNED BY public.sellers.sellerid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_userid_seq OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: cart_details cartdetailid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_details ALTER COLUMN cartdetailid SET DEFAULT nextval('public.cart_details_cartdetailid_seq'::regclass);


--
-- Name: carts cartid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts ALTER COLUMN cartid SET DEFAULT nextval('public.carts_cartid_seq'::regclass);


--
-- Name: categories categoryid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN categoryid SET DEFAULT nextval('public.categories_categoryid_seq'::regclass);


--
-- Name: items itemid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN itemid SET DEFAULT nextval('public.items_itemid_seq'::regclass);


--
-- Name: nurseries nurseryid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nurseries ALTER COLUMN nurseryid SET DEFAULT nextval('public.nurseries_nurseryid_seq'::regclass);


--
-- Name: order_details orderdetailid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details ALTER COLUMN orderdetailid SET DEFAULT nextval('public.order_details_orderdetailid_seq'::regclass);


--
-- Name: order_nursery ordernurseryid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_nursery ALTER COLUMN ordernurseryid SET DEFAULT nextval('public.order_nursery_ordernurseryid_seq'::regclass);


--
-- Name: orders orderid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN orderid SET DEFAULT nextval('public.orders_orderid_seq'::regclass);


--
-- Name: payments paymentid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN paymentid SET DEFAULT nextval('public.payments_paymentid_seq'::regclass);


--
-- Name: reviews reviewid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN reviewid SET DEFAULT nextval('public.reviews_reviewid_seq'::regclass);


--
-- Name: sellers sellerid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers ALTER COLUMN sellerid SET DEFAULT nextval('public.sellers_sellerid_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Data for Name: cart_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_details (cartdetailid, cartid, itemid, quantity) FROM stdin;
1	1	1	1
2	2	2	2
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (cartid, userid, created_date) FROM stdin;
1	1	2025-04-29 00:00:00
2	2	2025-04-29 00:00:00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (categoryid, name, description) FROM stdin;
1	Plants	All types of plants for home and garden
2	Seeds and Saplings	Seeds and young plants for cultivation
3	Gardening Tools	Tools and equipment for gardening tasks
4	Others	Miscellaneous gardening-related items
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (itemid, name, description, price, survival_hrs, picture, trending, stock, nurseryid, categoryid) FROM stdin;
1	Snake Plant	Low-maintenance indoor plant	450.00	72	/snakeplant.jpg	t	19	1	1
2	Rose Bush	Colorful flowering bush	800.00	48	/rose.jpg	f	10	2	1
3	Sunflower	Very nice and fresh sunflower	150.00	48	/sunflower.jpg	t	10	1	1
4	Tomato Seeds	High-yield heirloom tomato seeds	120.00	24	/tomato_seeds.jpeg	t	50	1	2
5	Basil Seeds	Fast-growing basil for cooking and teas	90.00	24	/basil_seeds.jpeg	f	40	2	2
6	Carrot Seeds	Organic sweet carrot variety	110.00	24	/carrot_seeds.jpeg	f	30	1	2
7	Sunflower Seeds	Grow your own tall sunflowers	100.00	24	/sunflower_seeds.jpeg	t	35	1	2
8	Pepper Seeds	Spicy chili pepper seed pack	130.00	24	/pepper_seeds.jpeg	t	25	2	2
9	Hand Trowel	Sturdy steel hand trowel for planting and digging	250.00	\N	/hand_trowel.jpg	t	30	1	3
10	Garden Pruner	Sharp pruner for trimming and shaping plants	450.00	\N	/garden_pruner.jpg	f	20	2	3
11	Watering Can	5-liter metal watering can with detachable nozzle	550.00	\N	/watering_can.jpg	t	15	1	3
12	Gardening Gloves	Durable gloves for protection while gardening	150.00	\N	/gardening_gloves.jpg	f	50	2	3
13	Garden Hoe	Heavy-duty hoe for breaking up soil and weeds	600.00	\N	/garden_hoe.jpg	t	10	1	3
14	Garden Gnome	Decorative gnome for your garden	300.00	\N	/garden_gnome.jpg	t	25	1	4
15	Bird Feeder	Attract birds with this stylish bird feeder	450.00	\N	/bird_feeder.jpg	t	40	2	4
16	Outdoor Lantern	Solar-powered outdoor lantern for lighting your garden	600.00	\N	/outdoor_lantern.jpg	f	15	1	4
17	Garden Stakes	Pack of 10 durable garden stakes for plant support	120.00	\N	/garden_stakes.jpg	t	60	2	4
18	Compost Bin	Eco-friendly compost bin for your organic waste	800.00	\N	/compost_bin.jpg	f	10	1	4
\.


--
-- Data for Name: nurseries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nurseries (nurseryid, sellerid, opening_hours, closing_hours, delivery_charges) FROM stdin;
1	1	08:00:00	18:00:00	150
2	2	09:00:00	19:00:00	200
\.


--
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_details (orderdetailid, ordernurseryid, itemid, quantity, price_at_order) FROM stdin;
1	1	1	2	500.00
2	2	2	1	800.00
\.


--
-- Data for Name: order_nursery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_nursery (ordernurseryid, orderid, nurseryid, subtotal) FROM stdin;
1	1	1	0.00
2	2	2	0.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (orderid, userid, order_date, total_amount, payment_status, order_status) FROM stdin;
2	2	2025-04-29 00:00:00	800.00	\N	completed
1	1	2025-04-29 00:00:00	1000.00	\N	pending
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (paymentid, orderid, payment_date, amount, payment_method) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (reviewid, rating, description, userid, itemid, created_at, is_read, heading) FROM stdin;
11	4	Leaves are thick and green. Took a few days to acclimate but now thriving.	2	1	2025-05-05 12:53:40.189666+00	f	Very sturdy leaves
12	3	Got a few brown tips on the Snake Plant, but overall still happy.	3	1	2025-05-05 12:53:40.189666+00	f	Too much sun exposure
13	5	The Rose Bush blooms are large and fragrant-absolutely beautiful!	1	2	2025-05-05 12:53:40.189666+00	f	Lovely rose blooms
14	4	Nice color but watch out for the thorns when pruning.	2	2	2025-05-05 12:53:40.189666+00	f	Thorns are sharp!
15	2	Leaves wilted after a week. Might have been overwatered.	3	2	2025-05-05 12:53:40.189666+00	f	Didn't last long
16	5	Sunflower arrived tall and cheery-such a mood booster!	1	3	2025-05-05 12:53:40.189666+00	f	Sunflower brightens room
17	3	One sunflower lost petals sooner than expected, but still pretty.	2	3	2025-05-05 12:53:40.189666+00	f	Petals fell off early
18	4	Healthy sunflower at a very reasonable price. Would buy again.	3	3	2025-05-05 12:53:40.189666+00	f	Great value for price
10	5	My Snake Plant arrived healthy and vibrant-perfect for beginners!	1	1	2025-05-05 12:53:40.189666+00	t	Excellent starter plant
\.


--
-- Data for Name: sellers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sellers (sellerid, name, email, phone, cnic, address, password, description) FROM stdin;
1	Green Thumb	greenthumb@example.com	1112223333	35202-1234567-8	Street 12, Garden Town	sellerpass1	Indoor plant specialist
2	Urban Jungle	urbanjungle@example.com	4445556666	35202-9876543-2	Block B, Model Town	sellerpass2	Outdoor plant expert
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (userid, name, email, phone, password) FROM stdin;
1	Alice	alice@example.com	1234567890	hashedpass1
2	Bob	bob@example.com	0987654321	hashedpass2
3	Charlie	charlie@example.com	1122334455	hashedpass3
\.


--
-- Name: cart_details_cartdetailid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_details_cartdetailid_seq', 1, false);


--
-- Name: carts_cartid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carts_cartid_seq', 1, false);


--
-- Name: categories_categoryid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_categoryid_seq', 1, false);


--
-- Name: items_itemid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_itemid_seq', 9, true);


--
-- Name: nurseries_nurseryid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nurseries_nurseryid_seq', 1, false);


--
-- Name: order_details_orderdetailid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_details_orderdetailid_seq', 1, false);


--
-- Name: order_nursery_ordernurseryid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_nursery_ordernurseryid_seq', 1, false);


--
-- Name: orders_orderid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_orderid_seq', 1, false);


--
-- Name: payments_paymentid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_paymentid_seq', 1, false);


--
-- Name: reviews_reviewid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_reviewid_seq', 18, true);


--
-- Name: sellers_sellerid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sellers_sellerid_seq', 1, false);


--
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_userid_seq', 1, false);


--
-- Name: cart_details cart_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_details
    ADD CONSTRAINT cart_details_pkey PRIMARY KEY (cartdetailid);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cartid);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (categoryid);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (itemid);


--
-- Name: nurseries nurseries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nurseries
    ADD CONSTRAINT nurseries_pkey PRIMARY KEY (nurseryid);


--
-- Name: order_details order_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_pkey PRIMARY KEY (orderdetailid);


--
-- Name: order_nursery order_nursery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_nursery
    ADD CONSTRAINT order_nursery_pkey PRIMARY KEY (ordernurseryid);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (orderid);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (paymentid);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (reviewid);


--
-- Name: sellers sellers_cnic_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers
    ADD CONSTRAINT sellers_cnic_key UNIQUE (cnic);


--
-- Name: sellers sellers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers
    ADD CONSTRAINT sellers_email_key UNIQUE (email);


--
-- Name: sellers sellers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sellers
    ADD CONSTRAINT sellers_pkey PRIMARY KEY (sellerid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: cart_details cart_details_cartid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_details
    ADD CONSTRAINT cart_details_cartid_fkey FOREIGN KEY (cartid) REFERENCES public.carts(cartid) ON DELETE CASCADE;


--
-- Name: cart_details cart_details_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_details
    ADD CONSTRAINT cart_details_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid);


--
-- Name: carts carts_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: items items_categoryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_categoryid_fkey FOREIGN KEY (categoryid) REFERENCES public.categories(categoryid);


--
-- Name: items items_nurseryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_nurseryid_fkey FOREIGN KEY (nurseryid) REFERENCES public.nurseries(nurseryid) ON DELETE CASCADE;


--
-- Name: nurseries nurseries_sellerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nurseries
    ADD CONSTRAINT nurseries_sellerid_fkey FOREIGN KEY (sellerid) REFERENCES public.sellers(sellerid) ON DELETE CASCADE;


--
-- Name: order_details order_details_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid);


--
-- Name: order_details order_details_ordernurseryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_ordernurseryid_fkey FOREIGN KEY (ordernurseryid) REFERENCES public.order_nursery(ordernurseryid) ON DELETE CASCADE;


--
-- Name: order_nursery order_nursery_nurseryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_nursery
    ADD CONSTRAINT order_nursery_nurseryid_fkey FOREIGN KEY (nurseryid) REFERENCES public.nurseries(nurseryid) ON DELETE CASCADE;


--
-- Name: order_nursery order_nursery_orderid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_nursery
    ADD CONSTRAINT order_nursery_orderid_fkey FOREIGN KEY (orderid) REFERENCES public.orders(orderid) ON DELETE CASCADE;


--
-- Name: orders orders_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: payments payments_orderid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_orderid_fkey FOREIGN KEY (orderid) REFERENCES public.orders(orderid) ON DELETE CASCADE;


--
-- Name: reviews reviews_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid) ON DELETE CASCADE;


--
-- Name: reviews reviews_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

