/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const snapshot = [
    {
      "id": "_pb_users_auth_",
      "created": "2024-01-07 18:43:10.502Z",
      "updated": "2026-04-08 18:11:15.352Z",
      "name": "users",
      "type": "auth",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "njnwgozr",
          "name": "role",
          "type": "relation",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "oit1426bxc4n50d",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        }
      ],
      "indexes": [],
      "listRule": "id = @request.auth.id",
      "viewRule": "id = @request.auth.id",
      "createRule": "",
      "updateRule": "id = @request.auth.id",
      "deleteRule": "id = @request.auth.id",
      "options": {
        "allowEmailAuth": true,
        "allowOAuth2Auth": true,
        "allowUsernameAuth": true,
        "exceptEmailDomains": null,
        "manageRule": null,
        "minPasswordLength": 8,
        "onlyEmailDomains": null,
        "onlyVerified": false,
        "requireEmail": false
      }
    },
    {
      "id": "3ghq3okw4e9u3h7",
      "created": "2024-02-28 13:25:59.525Z",
      "updated": "2026-04-07 23:20:44.287Z",
      "name": "clients",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "rtuvgcxq",
          "name": "name",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "2vqji4hp",
          "name": "phone",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "9qpaxopt",
          "name": "address",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "yycwiid4",
          "name": "created_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "et6eykwd",
          "name": "updated_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "tncsykbu",
          "name": "deleted_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "thygcjl4",
          "name": "deleted",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [],
      "listRule": "",
      "viewRule": "",
      "createRule": "",
      "updateRule": "",
      "deleteRule": "",
      "options": {}
    },
    {
      "id": "d7owddkjq6byksd",
      "created": "2024-02-28 13:27:47.755Z",
      "updated": "2026-04-07 23:20:44.287Z",
      "name": "products",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "l2eqidqu",
          "name": "name",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "5z1rivlb",
          "name": "unit_price",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "v8uepzwj",
          "name": "measure_unit",
          "type": "relation",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "defnylqa6c3g49s",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "hnhvro4f",
          "name": "created_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "gvt02x8c",
          "name": "updated_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "xvykeow1",
          "name": "deleted_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "k94kr6dw",
          "name": "deleted",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [],
      "listRule": "",
      "viewRule": "",
      "createRule": "",
      "updateRule": "",
      "deleteRule": "",
      "options": {}
    },
    {
      "id": "wabqv9usgiljong",
      "created": "2024-02-28 16:06:49.539Z",
      "updated": "2026-04-08 18:17:15.787Z",
      "name": "invoices",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "druf4cfj",
          "name": "client",
          "type": "relation",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "3ghq3okw4e9u3h7",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "jlx0gy77",
          "name": "discount",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "srhzoylm",
          "name": "total",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "v5ub4yng",
          "name": "date",
          "type": "date",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        },
        {
          "system": false,
          "id": "ovbvysbi",
          "name": "created_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "eagcjfxd",
          "name": "updated_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "btvbd147",
          "name": "deleted_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "yoq43sca",
          "name": "deleted",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [],
      "listRule": "",
      "viewRule": "",
      "createRule": "",
      "updateRule": "",
      "deleteRule": "",
      "options": {}
    },
    {
      "id": "cbusqm5pbt7nh92",
      "created": "2024-02-28 16:13:18.692Z",
      "updated": "2026-04-08 18:22:58.166Z",
      "name": "invoices_products",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "l6x0yike",
          "name": "invoice",
          "type": "relation",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "wabqv9usgiljong",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "vdgr5be5",
          "name": "product",
          "type": "relation",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "d7owddkjq6byksd",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "vyg7nahq",
          "name": "unit_price",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "f171lrsa",
          "name": "amount",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "tvgyvg1d",
          "name": "discount",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "c3boh4fx",
          "name": "total",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "9ivxisef",
          "name": "created_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "yfi4kidb",
          "name": "updated_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "u3gbmlxc",
          "name": "deleted_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "u699awfp",
          "name": "deleted",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [
        "CREATE INDEX `idx_4EAoOA0` ON `invoices_products` (`invoice`)"
      ],
      "listRule": "",
      "viewRule": "",
      "createRule": "",
      "updateRule": "",
      "deleteRule": "",
      "options": {}
    },
    {
      "id": "oit1426bxc4n50d",
      "created": "2024-04-11 19:19:45.024Z",
      "updated": "2026-04-07 23:20:44.287Z",
      "name": "roles",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "hrpvzrdf",
          "name": "name",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "8m2dq9oo",
          "name": "created_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "se9v4vrg",
          "name": "updated_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "ljwolrmg",
          "name": "deleted_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "jey6inma",
          "name": "deleted",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [],
      "listRule": "",
      "viewRule": "",
      "createRule": "",
      "updateRule": "",
      "deleteRule": "",
      "options": {}
    },
    {
      "id": "ur14h8gcnpxdzyv",
      "created": "2024-04-12 19:51:59.944Z",
      "updated": "2026-04-08 18:23:59.521Z",
      "name": "v_invoices",
      "type": "view",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "qtmqcogg",
          "name": "date",
          "type": "date",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        },
        {
          "system": false,
          "id": "dbxzx1zs",
          "name": "discount",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "ywovzymq",
          "name": "total",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "t26oarfk",
          "name": "client",
          "type": "json",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "maxSize": 1
          }
        },
        {
          "system": false,
          "id": "deecca93",
          "name": "invoice_products",
          "type": "json",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "maxSize": 1
          }
        },
        {
          "system": false,
          "id": "pvfj9yd8",
          "name": "deleted",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [],
      "listRule": "",
      "viewRule": "",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null,
      "options": {
        "query": "SELECT \n    i.id,\n    i.date,\n    i.discount,\n    i.total,\n    JSON_OBJECT(\n      'id', c.id,\n      'name', c.name\n    ) AS client,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'discount', ii.discount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_products,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    invoices_products ii ON i.id = ii.invoice  \nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    i.created,\n    i.updated,\n    i.deleted;"
      }
    },
    {
      "id": "kgipq57hx2r1m59",
      "created": "2024-05-01 18:30:42.094Z",
      "updated": "2026-04-07 23:20:44.289Z",
      "name": "x_deleted",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "hyyhiwmv",
          "name": "collection",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "ewzmahdf",
          "name": "record",
          "type": "json",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "maxSize": 2000000
          }
        },
        {
          "system": false,
          "id": "nt9menhq",
          "name": "deleted_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        }
      ],
      "indexes": [],
      "listRule": null,
      "viewRule": null,
      "createRule": null,
      "updateRule": null,
      "deleteRule": null,
      "options": {}
    },
    {
      "id": "defnylqa6c3g49s",
      "created": "2024-09-11 20:00:53.496Z",
      "updated": "2026-04-08 18:24:57.700Z",
      "name": "measureunits",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "c8oobxst",
          "name": "name",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "1swb0mol",
          "name": "created_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "ms15rpvs",
          "name": "updated_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "qktcmkt7",
          "name": "deleted_by",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "h7fhm7fo",
          "name": "deleted",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [],
      "listRule": "",
      "viewRule": "",
      "createRule": "",
      "updateRule": "",
      "deleteRule": "",
      "options": {}
    }
  ];

  const collections = snapshot.map((item) => new Collection(item));

  return Dao(db).importCollections(collections, true, null);
}, (db) => {
  return null;
})
