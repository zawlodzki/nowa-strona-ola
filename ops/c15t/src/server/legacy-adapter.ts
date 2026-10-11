import type { C15TOptions } from "@c15t/backend/types";

type Adapter = C15TOptions["adapter"];
type ORM = ReturnType<Adapter["createORM"]>;

function scopeLegacy(orm: ORM): ORM {
  const scoped: ORM = {
    ...orm,
    create(table, data) {
      return orm.create(table, { ...data, tenantId: null });
    },
    createMany(table, items) {
      return orm.createMany(
        table,
        items.map((data) => ({ ...data, tenantId: null })),
      );
    },
    findFirst(table, options) {
      return orm.findFirst(table, {
        ...options,
        where: (builder) =>
          builder.and(
            options.where?.(builder) ?? true,
            builder.isNull("tenantId"),
          ),
      });
    },
    findMany(table, options) {
      return orm.findMany(table, {
        ...options,
        where: (builder) =>
          builder.and(
            options?.where?.(builder) ?? true,
            builder.isNull("tenantId"),
          ),
      });
    },
    count(table, options) {
      return orm.count(table, {
        ...options,
        where: (builder) =>
          builder.and(
            options?.where?.(builder) ?? true,
            builder.isNull("tenantId"),
          ),
      });
    },
    updateMany(table, options) {
      return orm.updateMany(table, {
        ...options,
        where: (builder) =>
          builder.and(
            options.where?.(builder) ?? true,
            builder.isNull("tenantId"),
          ),
        set: { ...options.set, tenantId: null },
      });
    },
    deleteMany(table, options) {
      return orm.deleteMany(table, {
        ...options,
        where: (builder) =>
          builder.and(
            options.where?.(builder) ?? true,
            builder.isNull("tenantId"),
          ),
      });
    },
    upsert(table, options) {
      return orm.upsert(table, {
        ...options,
        where: (builder) =>
          builder.and(
            options.where?.(builder) ?? true,
            builder.isNull("tenantId"),
          ),
        create: { ...options.create, tenantId: null },
        update: { ...options.update, tenantId: null },
      });
    },
    transaction(callback) {
      return orm.transaction((transaction) =>
        callback(scopeLegacy(transaction)),
      );
    },
  };
  const allowedMethods = new Set([
    "create",
    "createMany",
    "findFirst",
    "findMany",
    "count",
    "updateMany",
    "deleteMany",
    "upsert",
    "transaction",
  ]);
  return new Proxy(scoped, {
    get(target, property, receiver) {
      if (typeof property === "string" && allowedMethods.has(property)) {
        return Reflect.get(target, property, receiver);
      }
      throw new Error(
        `Legacy consent ORM method ${String(property)} is not isolated`,
      );
    },
  });
}

export function isolateLegacyAdapter(adapter: Adapter): Adapter {
  return {
    ...adapter,
    createORM(schema) {
      return scopeLegacy(adapter.createORM.call(this, schema));
    },
  };
}
