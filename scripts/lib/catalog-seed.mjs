export function cartesian(groups) {
  return groups.reduce(
    (rows, group) => rows.flatMap((row) => group.options.map((option) => [...row, option])),
    [[]],
  );
}

export function buildCatalogSeed(products) {
  const productRows = [];
  const imageRows = [];
  const groupRows = [];
  const optionRows = [];
  const skuRows = [];

  for (const product of products) {
    const fixedPrice = product.priceMin === product.priceMax;
    productRows.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      status: fixedPrice ? "active" : "needs_pricing",
      base_price_satang: Math.round(product.priceMin * 100),
      price_min_satang: Math.round(product.priceMin * 100),
      price_max_satang: Math.round(product.priceMax * 100),
      track_inventory: false,
      sold_count: product.soldCount,
      source_url: product.sourceUrl,
    });
    product.images.forEach((imageUrl, position) => imageRows.push({ product_id: product.id, image_url: imageUrl, position }));
    product.variants.forEach((group, position) => {
      groupRows.push({ id: group.id, product_id: product.id, name: group.name, position });
      group.options.forEach((option, optionPosition) => optionRows.push({
        id: option.id,
        group_id: group.id,
        product_id: product.id,
        name: option.name,
        disabled: option.disabled,
        position: optionPosition,
      }));
    });
    const combinations = product.variants.length ? cartesian(product.variants) : [[]];
    for (const choices of combinations) {
      const optionIds = choices.map((option) => option.id).sort();
      skuRows.push({
        product_id: product.id,
        selection_key: optionIds.join("|"),
        option_ids: optionIds,
        label: choices.length ? choices.map((option) => option.name).join(" · ") : "แบบมาตรฐาน",
        price_satang: fixedPrice ? Math.round(product.priceMin * 100) : null,
        active: choices.every((option) => !option.disabled),
        stock_quantity: null,
      });
    }
  }
  return { productRows, imageRows, groupRows, optionRows, skuRows };
}

