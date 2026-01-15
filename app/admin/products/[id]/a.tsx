 <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text variant="sectionHeading">Variants ({variants.length})</Text>
              <Button
                type="button"
                variant="slim"
                onClick={addVariant}
                className="gap-2"
              >
                <Plus size={16} /> Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <Container variant="box" key={variant.id} className="p-0">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer bg-secondary/20 rounded-xl"
                  onClick={() => toggleVariant(variant.id)}
                >
                  <div className="flex items-center gap-4">
                    <Package size={16} />

                    <Text className="font-bold">
                      {skulify(product, variant) || "New Variant"}
                    </Text>
                  </div>

                  <div className="flex items-center gap-4">
                    <Text className="text-sm font-medium">
                      £{variant.price}
                    </Text>
                    <Button
                      variant="naked"
                      type="button"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVariant(variant.id);
                      }}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </Button>
                    {variant.isExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {variant.isExpanded && (
                  <div className="p-6 space-y-4">
                    <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        type="number"
                        label="Price (£)"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "price",
                            parseFloat(e.target.value)
                          )
                        }
                      />

                      <Input
                        label="Inventory Stock"
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "stock",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <Text variant="subHeading">Size Variant</Text>
                      <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputSelect
                          value={variant.sizeName}
                          options={Object.values(SizeNames)}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "sizeName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Text variant="subHeading">Color Variant</Text>

                      <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Name"
                          value={variant.colorName}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "colorName",
                              e.target.value
                            )
                          }
                        />

                        <Input
                          label="Hex"
                          type="color"
                          className=" h-10 [&::-webkit-color-swatch-wrapper]:p-0 "
                          value={variant.colorName}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "colorName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <InputCheck
                      label="Available for Sale"
                      checked={variant.availableForSale}
                      className="h-6 w-6"
                      onChange={(e) =>
                        updateVariant(
                          variant.id,
                          "availableForSale",
                          e.target.checked
                        )
                      }
                    />

                    {/* details */}
                    <div className="space-y-4 bg-primary/90 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <Text variant="subHeading"> Technical Details</Text>
                        <Button
                          variant="naked"
                          size="sm"
                          onClick={() => addDetail(variant.id)}
                          color="success"
                        >
                          <Plus size={14} /> Add Detail
                        </Button>
                      </div>

                      {variant.details?.map((detail: any, dIdx: number) => (
                        <div key={dIdx} className="flex gap-2 items-center">
                          <InputSelect
                            className="w-1/3"
                            value={detail.title}
                            options={Object.values(Detailtype)}
                            onChange={(e) =>
                              updateDetail(
                                variant.id,
                                dIdx,
                                "title",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            className="flex-1"
                            placeholder="Value (e.g. 100% Stoneware)"
                            value={detail.description}
                            onChange={(e) =>
                              updateDetail(
                                variant.id,
                                dIdx,
                                "description",
                                e.target.value
                              )
                            }
                          />
                          <Button
                            variant="naked"
                            color="danger"
                            onClick={() => {
                              const newDetails = variant.details.filter(
                                (_: any, i: number) => i !== dIdx
                              );
                              updateVariant(variant.id, "details", newDetails);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* discounts */}
                    <div className="space-y-4 bg-green-50/50 p-4 rounded-lg ">
                      <div className="flex justify-between items-center">
                        <Text variant="subHeading">Discounts & Promos</Text>

                        <Button
                          variant="naked"
                          size="sm"
                          onClick={() => addDiscount(variant.id)}
                          color="success"
                        >
                          <Plus size={14} /> Add Discount
                        </Button>
                      </div>
                      {variant.discounts?.map((disc: any, discIdx: number) => (
                        <div className="flex gap-2 items-center" key={discIdx}>
                          <Input
                            label="Code"
                            placeholder="Discount aplly without code"
                            value={disc.code}
                            onChange={(e) => {
                              const newD = [...variant.discounts];
                              newD[discIdx].code = e.target.value;
                              updateVariant(variant.id, "discounts", newD);
                            }}
                          />
                          <InputSelect
                            label="Type"
                            value={disc.type}
                            options={Object.values(DiscountType)}
                            onChange={(e) => {
                              const newD = [...variant.discounts];
                              newD[discIdx].type = e.target.value;
                              updateVariant(variant.id, "discounts", newD);
                            }}
                          />
                          {disc.type === DiscountType.PERCENTAGE ? (
                            <Input
                              label="%"
                              type="number"
                              value={disc.percentage}
                              onChange={(e) => {
                                const newD = [...variant.discounts];
                                newD[discIdx].percentage = parseFloat(
                                  e.target.value
                                );
                                updateVariant(variant.id, "discounts", newD);
                              }}
                            />
                          ) : (
                            <Input
                              label="Fixed Off"
                              type="number"
                              value={disc.value}
                              onChange={(e) => {
                                const newD = [...variant.discounts];
                                newD[discIdx].value = parseFloat(
                                  e.target.value
                                );
                                updateVariant(variant.id, "discounts", newD);
                              }}
                            />
                          )}
                          <Button
                            variant="naked"
                            color='danger'
                            onClick={() => {
                              const newD = variant.discounts.filter(
                                (_: any, i: number) => i !== discIdx
                              );
                              updateVariant(variant.id, "discounts", newD);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <InputImage
                      label="Variant Images"
                      multiple={true}
                      images={gallery.files}
                      previews={gallery.previews}
                      onImagesChange={setGallery}
                      error={errors.images}
                    />
                  </div>
                )}
              </Container>
            ))}
          </div>