module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define(
      'Review',
      {
        review_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        review: {
          type: DataTypes.STRING(300),
          allowNull: false,
        },
        rating: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        created_on: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        }
      },
      {
        timestamps: false,
        tableName: 'review',
      }
    );
  
    Review.associate = ({ Product }) => {
      Review.belongsTo(Product, {
        through: 'product_id',
        foreignKey: 'product_id',
      });
    };
  
    return Review;
  };
  